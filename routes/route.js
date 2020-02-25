var multer = require('multer');
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './public/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});

var camstorage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './routes/students/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});

var excel = multer({ //multer settings
    storage: storage,
    fileFilter : function(req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('excel');


var rexcel = multer({ //multer settings
    storage: storage,
    fileFilter : function(req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('rexcel');
/** API path that will upload the fi*/

 var cam = multer({ //multer settings
    storage: camstorage
 }).single('photo');

// INSTITUTION SETTINGS or PREFERENCES
let settings = {
    appName: 'eduHub',
    appType: 2, // 1=Creche_JHS, 2=SHS/trainco 
    instituteLong:'KWANMOMAN SENIOR HIGH SCHOOL',
    instituteShort:'KWAHIS',
    instituteMotto: 'Bringing togetherness to all',
    instituteHead : 'John Ampomah',
    instituteAddress : 'Opposite Praise Baptist Church, Kakumdo Road',
    institutePost: 'Opposite Praise Baptist Church,<br> Kakumdo Road',
    institutePhones:'+233 277 675089, +233 277 675089',
    instituteEmail:'info@kwahis.com',
    instituteWeb:'www.kwahis.com',
    pwd :'kwahis',
    phone: '0277675089',
    primaryColor : '#003989',
    secondColor : '#deeaf5',
    accentColor: '#e8e6db',
    loginColor:'rgba(0, 71, 171,0.7)',
    logo : '/public/logo.jpg',
    bg : '/public/bg.jpg'
}

const save = require('save-file');
var FPDF = require('../node_modules/fpdf-njs/fpdf.js');
var PDFDoc = require('pdfkit');
var fx = require('fs');


module.exports = (app,conn,init,dbx,md5,Webcam,xls,xlsx,json2xls,fs) => {
     // Check Authentication Middleware
     isAuthenticated = (req, res, next) => {
        if (req.session.authenticated)
            return next();      
        res.redirect('/');
    }
    
    app.get('/', async (req,res) => {         
          res.redirect('/login')
    });

    app.get('/login',(req,res) => {  
        // Check If Still logged-In
        if(req.session.authenticated != null && req.session.authenticated){
            res.redirect('/dash'); 
         }else{        
            res.render('admin/xlogin',{settings});
         }          
    });

    app.get('/logout',(req,res) => {
        req.session.destroy();       
        res.redirect('/login');
    });
     
    // Login -- Post
    app.post('/login/',async(req,res) => {
        let username = req.body.username;
        let password = req.body.password;
        if(username == '' || password == '')  res.redirect('/login');

        let user = await dbx.query("select * from user where username = '"+username+"' and password = '"+md5(password)+"'");
        let stud = await dbx.query("select * from student where index_number = '"+username+"' and password = '"+md5(password)+"'");
        if(user.length > 0){
            // Admin 
            req.session.user = user[0]; 
            req.session.user.loggedin = true;
            req.session.authenticated = true; 
            req.session.save();                     
            res.redirect('/dash');
        }else if(stud.length > 0){
            // Student
            req.session.user = stud[0]; 
            req.session.user.loggedin = true;
            req.session.authenticated = true; 
            req.session.save();
            res.redirect('/dash');
        }else{
            // Failed Authentication
            req.session.authenticated = false;
            res.redirect('/login');
        }
                
    });


    // Dashboard Page
    app.get('/dash',isAuthenticated,(req,res) => { 
        if(req.session.user.index_number != null && req.session.user.username == null){
            res.redirect('/st_dash');
        }else{
            res.render('admin/eDash.ejs',{
                parent: 'eJHS',            
                title : 'Dashboard',
                session: req.session.user,settings
            });
        }       
    });


    /* Student Routing  */   
    // Students -- Post Form - Insert
    app.post('/student/post',async(req,res)=>{
        let data = req.body;
        console.log(req.body);
        let id = req.body.id;      
        
            if(id <= 0){              
                 /* E-JHS / SHS / PRIMARY */
                 data['indate'] = new Date();
                 if(data['index_number'].trim() == ''){
                    let st = await dbx.query("select * from student where date_format(indate,'%Y') = "+new Date().getFullYear()+" order by id desc limit 1");
                    if(st.length > 0){
                        // Index number Algorithm for school
                        data['index_number'] = parseInt(st[0].index_number)+1;                       
                        await dbx.query("insert into student set ?",data);
                       
                    }else{
                        // Index number Algorithm for school                                
                        let indx = new Date().getFullYear()+'0001';
                        data['index_number'] = indx;
                        await dbx.query("insert into student set ?",data);                       
                    }

                 }else{        
                    await dbx.query("insert into student set ?",data);                           
                 }
        }else{
            await dbx.query("update student set ? where id ="+id,data);       
        }
        res.redirect('/student/list?msg=saved');            
    });

    // Students -- Add New Student
    app.get('/student/add',isAuthenticated,(req,res) => { 
        conn((err,db)=>{
            db.query("select * from program; select * from hall; select * from `groups`",(err,rows)=>{
                res.render('index.ejs',{
                    parent: 'student',
                    view  : 'addstd',
                    title : 'Add New Student',
                    row:{id:0},progs: rows[0],halls: rows[1],groups: rows[2],
                    session: req.session.user,settings
                });
                db.release(); 
            });
        });        
    });

    // Upload Excel -- Add Student
    app.post('/student/excel', async(req, res) => {
        var exceltojson;
        excel(req,res,async(err)=>{
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
            /** Multer gives us file info in req.file object */
            if(!req.file){
                res.json({error_code:1,err_desc:"No file passed"});
                return;
            }
            /** Check the extension of the incoming file and 
             *  use the appropriate module
             */
            if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsx;
            }else {
                exceltojson = xls;
            }
            try{
                exceltojson({
                    input: req.file.path,
                    output: null, // since we don't need output.json
                    lowerCaseHeaders:true
                },async(err,results) => { 
                    console.log("EXCEL DATA :")    
                    console.log(results);  
                    console.log(results[0]['lname']);               
                    // Code for Inserting Data                    
                    for(var i = 0; i < results.length; i++){
                        console.log(results[i]['lname']);
                        let gp = await dbx.query("select g.id as gid,g.*,p.id as pid,p.* from `groups` g left join program p on g.program_id = p.id  where g.name = '"+results[i]['group'].trim()+"' and g.academic_status = 'ACTIVE'");
                       

                        /* E-JHS / SHS / PRIMARY */
                       if(results[i]['indexno'].trim() == ''){
                            let st = await dbx.query("select * from student where date_format(indate,'%Y') = "+new Date().getFullYear()+" order by id desc limit 1");
                            let dob = results[i]['dob'].trim().split('/');
                            if(st.length > 0){
                                // Index number Algorithm for school
                                let ind = st[0].index_number;
                                let indx = parseInt(ind)+1;
                                let data = {
                                    fname:results[i]['fname'].trim(),
                                    lname:results[i]['lname'].trim(),
                                    index_number:indx,
                                    gender: results[i]['gender'].trim(),
                                    dob:new Date(dob[2],dob[1]-1,dob[0]),
                                    phone:results[i]['phone'].trim(),
                                    address:results[i]['address'].trim(),
                                    year_group:gp[0].gid,
                                    program_id:gp[0].pid,
                                    indate:new Date()}
                                dbx.query("insert into student set ?",data);
                               
                            }else{
                                // Index number Algorithm for school                                
                                let indx = new Date().getFullYear()+'0001';
                                let data = {
                                    fname:results[i]['fname'].trim(),
                                    lname:results[i]['lname'].trim(),
                                    index_number:indx,
                                    gender: results[i]['gender'].trim(),
                                    dob:new Date(dob[2],dob[1]-1,dob[0]),
                                    phone:results[i]['phone'].trim(),
                                    address:results[i]['address'].trim(),
                                    year_group:gp[0].gid,
                                    program_id:gp[0].pid,
                                    indate:new Date()
                                }
                                dbx.query("insert into student set ?",data);                               
                            }
                        }else{                            
                            let data = {
                                fname:results[i]['fname'].trim(),
                                lname:results[i]['lname'].trim(),
                                index_number:results[i]['indexno'].trim(),
                                gender: results[i]['gender'].trim(),
                                dob:new Date(dob[2],dob[1]-1,dob[0]),
                                phone:results[i]['phone'].trim(),
                                address:results[i]['address'].trim(),
                                year_group:gp[0].gid,
                                program_id:gp[0].pid,
                                indate:new Date()}
                            dbx.query("insert into student set ?",data);                           
                        }
                    }                      
                      // Remove File uploaded
                      fs.unlinkSync(req.file.path);                
                });
            }catch (e){
                res.json({error_code:1,err_desc:"Corupted excel file"});
            }
        })

           // Redirect to student page
              res.redirect('/student/list');            
    }); 


    // Students -- Edit Student
    app.get('/student/edit/:id',isAuthenticated,(req,res) => { 
        let id = req.params.id;
        conn((err,db)=>{
            db.query("select *, DATE_FORMAT(dob,'%Y-%m-%d') as dob from student where id = "+id+";select * from program; select * from hall; select * from `groups`",(err,rows)=>{
                res.render('index.ejs',{
                    parent: 'student',
                    view  : 'addstd',
                    title : 'Edit Student',
                    row: rows[0][0],progs: rows[1],halls: rows[2],groups: rows[3],
                    session: req.session.user,settings
                });
                db.release(); 
            });
        });        
    });


    // Students -- Edit Student
    app.get('/student/del/:id',isAuthenticated,(req,res) => { 
        let id = req.params.id;
        conn((err,db)=>{
            db.query("delete from student where id = "+id,(err,rows)=>{
                res.redirect('/student/list?msg=deleted'); 
            });
            db.release(); 
        });        
    });

    // Students -- Allow Register ( Administrative Privilege )
    app.get('/student/regadd/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        dbx.query("update student set allow_register = '1' where id = "+id);
        res.redirect('/student/list');                       
    });

    // Students -- Disallow Register ( Administrative Privilege )
    app.get('/student/regrem/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        dbx.query("update student set allow_register = '0' where id = "+id);
        res.redirect('/student/list');                         
    });

 
    // Students -- Student File
    app.get('/student/view/:id',async(req,res) => { 
        let id = req.params.id;       
        let std = await dbx.query("select * from student where id ="+id);        
        let rows =  await dbx.query("select s.*, p.name as prog,g.*,g.name as gname, DATE_FORMAT(s.dob,'%d/%m/%Y') as dobx from student s left join program p on s.program_id = p.id left join `groups` g on s.year_group = g.id where s.id = "+id);
       
        /*  WORKING
        let gpa = scheme[0].score.split(',').filter((row,i) => {
            let rdata = row.split(":");  
            if(rdata[0] >= cmark && rdata[1] <= cmark){
                req.session.index = i;
                req.session.save();
                return scheme[0].remark.split(',')[i];
            }            
        });  let cgpa = scheme[0].remark.split(',')[req.session.index];
        
         */         
        res.render('report/stslip',{row: rows[0],session: req.session.user,settings});       
    });

/*
    // Students -- Student File
    app.get('/student/cam/:id',async(req,res) => { 
        let id = req.params.id;
        let row = await dbx.query("select * from student where id = "+id);
        let index = row[0].index_number.split('/').join('_');
          // Will automatically append location output type 
           Webcam.capture('public/students/'+index+'.jpg', async( err, data ) => {
               if(err) console.log(err);
               console.log(data);
               let photo = '/'+data;
               await dbx.query("update student set photo = '"+photo+"' where id = "+id);
               res.send('<center><img style="height:240px;padding:5px;box-shadow:0px 0px 5px #000" src="'+photo+'"/><br><br><a style="padding:10px 15px;text-decoration:none;margin:10px auto;color:#fff;background:#f90;font-weight:bolder;border:2px solid #f93;" href="/student/cam/'+row[0].id+'">SNAP </a><a style="padding:10px 15px;text-decoration:none;margin:10px 5px 10px;color:#fff;background:red;font-weight:bolder;border:2px solid red;" href="javascript:window.close();">SAVE &CLOSE </a></center')
           });
               
    });
*/

// Students -- Student Remove Photo
 app.get('/student/rempic/:id',isAuthenticated,async(req,res) => { 
    let id = req.params.id;
    let row = await dbx.query("select * from student where id = "+id);    
    try{ 
        fs.unlinkSync('.'+row[0].photo)  
    }catch(e){
        console.log(e);
    };
    await dbx.query("update student set photo = null where id = "+id);   
    // Redirect to student page
    res.redirect('/student/list');        
 });

 // Students -- Student File
app.get('/student/cam/:id',isAuthenticated,async(req,res) => { 
    let id = req.params.id;
    let row = await dbx.query("select * from student where id = "+id);
    res.render('ajax/cam',{row:row[0],settings});
});


// Students -- Student File
app.post('/student/camsave/',isAuthenticated,cam,async(req,res) => {     
    let id = req.body.id ? req.body.id : req.query.id;
    let row = await dbx.query("select * from student where id = "+id);                
    let index = row[0].index_number.split('/').join('_');
    let imgpath = '/public/students/'+index+'.jpg';
    const file = './public/students/'+index+'.jpg';
    console.log(req.body.data_uri);
    if(req.files && req.files.photo){
        req.files.photo.mv(file);
        await dbx.query("update student set photo = '"+imgpath+"' where id = "+id);               
    }else{
        save(req.body.data_uri,'../'+file, async(err, data) => {   
            console.log(data);         
            await dbx.query("update student set photo = '"+imgpath+"' where id = "+id);               
        });
    }
     // Redirect to student page
     res.redirect('/student/list');        
});


    /*
    // Students -- Student File
    app.get('/student/vcard/:id',async(req,res) => { 
        let id = req.params.id; 
        let row = await dbx.query("select s.*,g.name as gname,p.name as prog, g.exit_year from student s left join program p on p.id = s.program\\
        `````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````_id left join `groups` g on g.id = s.year_group where s.id = "+id);
      //  let index = row[0].index_number.split('/').join('_');
        //res.render('report/vcard',{row:row[0],settings});  
        // CARD SCRIPT
        var pdf = new FPDF();
        pdf.CreatePDF('L','cm',new Array(8.5598,5.3975));
        pdf.AddPage();
        pdf.SetFont('Arial','B',16);
        pdf.Cell(40,10,'Hello World!');
        pdf.Output('D','kobby.pdf',true,res);       
    });
    */


     // Students -- Student File
     app.get('/student/vcard/:id',async(req,res) => { 
        let id = req.params.id;
        let row = await dbx.query("select s.*,g.name as gname,p.name as prog, g.exit_year from student s left join program p on p.id = s.program_id left join `groups` g on g.id = s.year_group where s.id = "+id);
        //let index = row[0].index_number.split('/').join('_');
        //res.render('report/vcard',{row:row[0],settings});  
       
        // CARD SCRIPT
        // console.log(res);

        var doc = new PDFDoc({          
            layout: 'portrait',
            size:[242.64,153],
            margins : { // by default, all are 72
                top: 0, 
                bottom: 0,
                left: 0,
                right: 0
            },          
            info: {
                Title: row[0].fname+' '+row[0].lname+' ID CARD', 
                Author: settings.instituteShort, // the name of the author
            }
        });  

       
        //FRONT - doc.addPage('landscape',[242.64,153])             
        doc.image('./public/card/front.jpg',0,0,{scale:0.24}) 
        doc.rect(0,0,242.64,55).fill(settings.primaryColor) // Top Rect
        doc.rect(0,150,242.64,55).fill(settings.primaryColor) // Bottom Rect
        doc.rect(80,48,80,12).fillAndStroke(settings.accentColor,settings.primaryColor) // Title Rect
        doc.image('./public/logo.jpg',10,8,{height:40})  // Logo
        doc.fontSize(10).fillColor(settings.accentColor).text(settings.instituteLong,58,10) // Institution Name
        doc.fontSize(6).fillColor(settings.secondColor).text(settings.instituteAddress.toUpperCase(),58,23) // Institution Address
        doc.font('Times-Italic').fontSize(6).fillColor(settings.accentColor).text("~ "+settings.instituteMotto,58,32) // Institution Motto
        doc.font('Helvetica-Bold').fontSize(7).fillColor(settings.primaryColor).text("STUDENT ID CARD",90,52) // ID Card title
        doc.image(row[0].photo ? '.'+row[0].photo:'./public/card/nopic.png',175,65,{width:60}) // Student Photo
        doc.font('Helvetica-Bold').fontSize(7).fillColor(settings.primaryColor).strokeColor(settings.accentColor).text('NAME: ',5,67) 
        doc.fontSize(7).text((row[0].fname+' '+row[0].lname).toUpperCase(),35,67)
        doc.fontSize(7).fillColor(settings.primaryColor).strokeColor(settings.accentColor).text('ID NUMBER: ',5,80) 
        doc.fontSize(8).text((row[0].index_number).toUpperCase(),55,80) 
        doc.fontSize(7).fillColor(settings.primaryColor).strokeColor(settings.accentColor).text('PROGRAM: ',5,93) 
        doc.fontSize(8).text((row[0].prog).toUpperCase(),55,93) 
        doc.fontSize(7).fillColor(settings.primaryColor).strokeColor(settings.accentColor).text('GENDER: ',5,107) 
        doc.fontSize(8).text((row[0].gender == 'M'?'MALE':'FEMALE').toUpperCase(),55,107) 
        // BACK -- ID CARD
        doc.addPage()
        //doc.image('./public/card/back.jpg',0,0,{scale:0.12}) 
        doc.rect(0,0,242.64,153)
           .fill("white").fillOpacity(0.10)
        doc.image('./public/logo.jpg',20,-20,{width:200})  // Logo 
        doc.rect(0,0,242.64,3).fill(settings.primaryColor).fillOpacity(1.0) // Top Rect
        doc.rect(0,0,242.64,3).fill(settings.primaryColor).fillOpacity(1.0) // Top Rect
        doc.rect(0,150,242.64,55).fill(settings.primaryColor).fillOpacity(1.0) // Bottom Rect
        doc.font('Times-Italic').fontSize(8).fillColor(settings.primaryColor).text(` If found, Please return to \n\n The Head Teacher,\n ${settings.instituteLong}\n${settings.instituteAddress}\n\n${settings.institutePhones}`,10,32,{align:'center'}) // Institution Motto
        doc.font('Helvetica-Bold').fontSize(8).text('EXPIRES ON OCTOBER, 2019', 60, 115)         
        
        doc.pipe(res);  
        doc.end()       
    });



    // Students -- current
    app.get('/student/list',isAuthenticated,(req,res) => { 
       
        let msg = req.query.msg || '';         
        conn((err,db) => {
         if(err) console.error(err);
            db.query("select DATE_FORMAT(s.dob,'%Y/%m/%d') as dobs,s.*,p.name as program,h.name as hall,g.level,p.prefix from student s left join program p on s.program_id = p.id left join hall h on s.hall_id = h.id left join `groups` g on s.year_group = g.id where s.academic_status = 'ACTIVE'",(err,rows)=>{
                if(err) console.error(err);
                res.render('index.ejs',{
                    parent: 'student',
                    view  : 'listd',
                    title : 'Current Student',
                    rows : rows,
                    msg: msg,
                    session: req.session.user,settings
                });                
                db.release();  
           });
       });
      
    });


    // Students -- current
    app.get('/student/reg',(req,res) => {       
        res.render('index.ejs',{
            parent: 'student',
            view  : 'listreg',
            title : 'Registered Student',
            session: req.session.user,settings
        });
    });


    // Student Module - JSON
    app.post('/student/gson', async(req,res) => {       
              
        let sqlRec = "";
        let sqlTot = "";
        let where = "";           
        params = req.body;
       
        columns = Array(10);
        columns[0] = 'photo';
        columns[1] = 'name';
        columns[2] = 'index_number';
        columns[3] = 'gender';
        columns[4] = 'dobs';
        columns[5] = 'class';
        columns[6] = 'program';
        columns[7] = 'action';
        columns[8] = 'phone'; 
        columns[9] = 'address'; 
               
        
        if(params["search[value]"] != ''){
            where += " and (index_number like '%"+params["search[value]"]+"%' ";
            where += " or fname like '%"+params["search[value]"]+"%' ";
          //  where += " or mname like '%"+params["search[value]"]+"%' ";
            where += " or lname like '%"+params["search[value]"]+"%' ";
            where += " or p.name like '%"+params["search[value]"]+"%' ";

            where += (settings.appType == 1) ? " or concat(p.prefix,g.level) like '%"+params["search[value]"]+"%' " : " or concat(g.level,p.prefix) like '%"+params["search[value]"]+"%' ";
            where += " or gender = '"+(params["search[value]"].toLowerCase() == 'male'? 'M':'')+"' ";
            where += " or gender = '"+(params["search[value]"].toLowerCase() == 'female'? 'F':'')+"' ";
            where += " or phone like '%"+params["search[value]"]+"%')";
           // where += " or date_format(dob,'%Y-%m-%d') like '%date_format("+(new Date(params["search[value]"]))+",'%Y-%m-%d')%' )";
        }
      
        let sql = "select DATE_FORMAT(s.dob,'%Y/%m/%d') as dobs,s.*,p.name as program,h.name as hall,g.level,p.prefix,g.name as gname from student s left join program p on s.program_id = p.id left join hall h on s.hall_id = h.id left join `groups` g on s.year_group = g.id where s.academic_status = 'ACTIVE'";
        sqlRec += sql;
        sqlTot += sql;

        if(where != ''){
            sqlRec += where;
            sqlTot += where;
        }
        sqlRec += settings.appType == 1 ? " order by concat(p.prefix,g.level) "+params["order[0][dir]"]+" limit "+params['start']+","+params['length']+"" : " order by concat(g.level,p.prefix) "+params["order[0][dir]"]+" limit "+params['start']+","+params['length']+"";

        let rowsRec = await dbx.query(sqlRec); 
        let rowsTot = await dbx.query(sqlTot);
             
        let data = await Promise.all(rowsRec.map(async (row,i,array) =>{
              let m = 0;
              if(m == 0){
                    row.photo = '<a href="'+(row.photo != null ? row.photo : 'javascript:;')+'" target="_blank"><img height="45px" src="'+(row.photo != null ? row.photo : '/public/none.png')+'" alt="'+row.fname+'"/></a>';
                    row.name = '<small><b>'+row.fname+' '+row.lname+'</b></small>';
                    row.class = '<b>'+row.gname+'</b>';
                    row.program = '<small>'+row.program+'</small>';               
                    row.action = '<!-- For Only Accountants --><div class="btn-group" style="width:280px;margin:5px 0;"><a href="javascript:window.open(\'/transcript/'+row.index_number.split('/').join('_')+'\',\'height=480,width=640,location=no\')" style="margin:0 1px" class="btn btn-info"><b>REPORTS</b></a><a target="_blank" href="/student/vcard/'+row.id+'" style="margin:0 1px" class="btn btn-success" title="Generate ID Card" onclick="return confirm(\'Generate ID Card?\')"><b>ID</b></a><a target="_blank" href="/transact/'+row.index_number.split('/').join('_')+'" style="margin:0 1px" class="btn btn-success" title="View Fees & Payment Transaction Statement"><b>TS</b></a><a target="_blank" href="/bill/student/'+row.index_number.split('/').join('_')+'" style="margin:0 1px" class="btn btn-success" title="View Posted Bills of Student"><b>BS</b></a><a target="_blank" href="/student/reset/'+row.index_number.split('/').join('_')+'" title="Reset Password" style="margin:0 1px" class="btn btn-info"><i class="fa fa-lock"></i> </a></div><div class="btn-group" style="width:250px;"><a href="/student/view/'+row.id+'" target="_blank" class="btn btn-warning" style="margin:0 1px" onclick="return confirm(\'View Student\\\'s File?\')"><i class="fa fa-eye" title="View Student File"></i></a><a href="/student/edit/'+row.id+'" class="btn btn-success" style="margin:0 1px" onclick="return confirm(\'Do you want to edit Record?\')" title="Edit Record"><i class="fa fa-edit"></i></a><a href="javascript:;" class="btn btn-info" style="margin:0 1px" onclick="if(!confirm(\'Please take snapshot of student!\')){return false;}else{ window.open(\'/student/cam/'+row.id+'\',\'Photo Album\',\'height=350,width=350\'); }" title="Take Photo Shot"><i class="fa fa-camera"></i></a>'; 
                    row.action += '<a href="javascript:;" onclick="document.getElementById(\'photo\').click()" class="btn btn-info" style="margin:0 1px" title="Upload Photo"><i class="fa fa-photo"></i></a>';
                    row.action += '<form name="form'+row.id+'" id="form'+row.id+'" style="display:inline;margin:0" data-form="'+row.id+'" action="/student/camsave?id='+row.id+'&'+Math.random()+'" method="post" enctype="multipart/form-data"><input type="file" name="photo" id="photo" style="display:none;" onchange="this.form.submit();"/><input type="hidden" name="id" value="'+row.id+'"/></form><a href="/student/rempic/'+row.id+'" class="btn btn-warning" style="margin:0 1px" onclick="return confirm(\'Do you want to Remove Photo?\')" title="Remove Photo"><i class="fa fa-minus-circle fa-lg"></i></a><a href="/student/del/'+row.id+'" class="btn btn-danger" style="margin:0 1px" onclick="return confirm(\'Delete Record?\')" title="Delete Record"><i class="fa fa-trash"></i></a></div>';	
                    row.phone = row.phone == 0 ? '(xxx)-xxx-xxxx' : row.phone;
                    row.address = '<small>'+row.address.toUpperCase()+'</small>';	
                    row.index_number = '<small><b>'+row.index_number+'</b></small>';                    
              }
              return row;
        }));
              
        res.json({
            draw : Number(params.draw),
            recordsTotal : Number(rowsTot.length),
            recordsFiltered : Number(rowsTot.length),
            data: data
        });      
    });


     
    // Graduated Students
    app.get('/graduate/list',isAuthenticated,(req,res) => { 
       
        let msg = req.query.msg || '';         
        conn((err,db) => {
         if(err) console.error(err);
            db.query("select DATE_FORMAT(s.dob,'%Y/%m/%d') as dobs,s.*,p.name as program,h.name as hall,g.level,p.prefix from student s left join program p on s.program_id = p.id left join hall h on s.hall_id = h.id left join `groups` g on s.year_group = g.id where s.academic_status = 'GRADUATED'",(err,rows)=>{
                if(err) console.error(err);
                res.render('index.ejs',{
                    parent: 'student',
                    view  : 'listgrad',
                    title : 'Graduates',
                    rows : rows,
                    msg: msg,
                    session: req.session.user,settings
                });                
                db.release();  
           });
       });
      
    });



     // Graduate Module - JSON
    app.post('/graduate/gson', async(req,res) => {              
        let sqlRec = "";
        let sqlTot = "";
        let where = "";           
        params = req.body;       
        columns = Array(10);
        columns[0] = 'photo';
        columns[1] = 'name';
        columns[2] = 'index_number';
        columns[3] = 'gender';
        columns[4] = 'dobs';
        columns[5] = 'class';
        columns[6] = 'program';
        columns[7] = 'action';
        columns[8] = 'phone'; 
        columns[9] = 'address'; 
               
        
        if(params["search[value]"] != ''){
            
            where += "and (index_number like '%"+params["search[value]"]+"%' ";
            where += " or fname like '%"+params["search[value]"]+"%' ";
          //  where += " or mname like '%"+params["search[value]"]+"%' ";
            where += " or lname like '%"+params["search[value]"]+"%' ";
            where += " or p.name like '%"+params["search[value]"]+"%' ";

            where += (settings.appType == 1) ? " or concat(p.prefix,g.level) like '%"+params["search[value]"]+"%' " : " or concat(g.level,p.prefix) like '%"+params["search[value]"]+"%' ";
            where += " or gender = '"+(params["search[value]"].toLowerCase() == 'male'? 'M':'')+"' ";
            where += " or gender = '"+(params["search[value]"].toLowerCase() == 'female'? 'F':'')+"' ";
            where += " or phone like '%"+params["search[value]"]+"%')";
           // where += " or date_format(dob,'%Y-%m-%d') like '%date_format("+(new Date(params["search[value]"]))+",'%Y-%m-%d')%' )";
        }
      
        let sql = "select DATE_FORMAT(s.dob,'%Y/%m/%d') as dobs,s.*,p.name as program,h.name as hall,g.level,p.prefix from student s left join program p on s.program_id = p.id left join hall h on s.hall_id = h.id left join `groups` g on s.year_group = g.id  where s.academic_status = 'GRADUATED'";
        sqlRec += sql;
        sqlTot += sql;

        if(where != ''){
            sqlRec += where;
            sqlTot += where;
        }
        sqlRec += settings.appType == 1 ? " order by concat(p.prefix,g.level) "+params["order[0][dir]"]+" limit "+params['start']+","+params['length']+"" : " order by concat(g.level,p.prefix) "+params["order[0][dir]"]+" limit "+params['start']+","+params['length']+"";

        let rowsRec = await dbx.query(sqlRec); 
        let rowsTot = await dbx.query(sqlTot);
               
        let data = await Promise.all(rowsRec.map(async (row,i,array) =>{
              let m = 0;
              if(m == 0){
                    row.photo = '<a href="'+(row.photo != null ? row.photo : 'javascript:;')+'" target="_blank"><img height="45px" src="'+(row.photo != null ? row.photo : '/public/none.png')+'" alt="'+row.fname+'"/></a>';
                    row.name = '<small><b>'+row.fname+' '+row.lname+'</b></small>';
                    row.class = settings.appType == 1 ? '<b>'+row.prefix+row.level+'</b>' : '<b>'+row.level+row.prefix+'</b>';
                    row.program = '<small>'+row.program+'</small>';               
                    row.action = '<!-- For Only Accountants --><div class="btn-group" style="width:230px;margin:5px 0;"><a href="javascript:window.open(\'/transcript/'+row.index_number.split('/').join('_')+'\',\'height=480,width=640,location=no\')" style="margin:0 1px" class="btn btn-info">TRANSCRIPT</a><a target="_blank" href="/student/vcard/'+row.id+'" style="margin:0 1px" class="btn btn-success">VCARD</a><a target="_blank" href="/transact/'+row.index_number.split('/').join('_')+'" title="Statement of Transactions"style="margin:0 1px" class="btn btn-success"><b>TS</b></a></div><div class="btn-group" style="width:200px;"><a href="/student/view/'+row.id+'" target="_blank" class="btn btn-warning" style="margin:0 1px" onclick="return confirm(\'View Student\\\'s File?\')"><i class="fa fa-eye"></i></a><a href="/student/edit/'+row.id+'" class="btn btn-success" style="margin:0 1px" onclick="return confirm(\'Do you want to edit Record?\')"><i class="fa fa-edit"></i></a><a href="javascript:;" class="btn btn-info" style="margin:0 1px" onclick="if(!confirm(\'Please take snapshot of student!\')){return false;}else{ window.open(\'/student/cam/'+row.id+'\',\'Photo Album\',\'height=350,width=350\'); }"><i class="fa fa-camera"></i></a>'; 
                    row.action += '<a href="javascript:;" onclick="document.getElementById(\'photo\').click()" class="btn btn-info" style="margin:0 1px"><i class="fa fa-photo"></i></a>';
                    row.action += '<form style="display:inline;margin:0" data-form="'+row.id+'"action="/student/photo" method="post" enctype="multipart/form-data" id="photoform"><input type="file"  name="photo" id="photo" style="display:none;"/><input type="hidden" name="id" value="'+row.id+'"/></form><a href="/student/del/'+row.id+'" class="btn btn-danger" style="margin:0 1px" onclick="return confirm(\'Delete Record?\')"><i class="fa fa-trash"></i></a></div>';	
                    row.phone = row.phone == 0 ? '(xxx)-xxx-xxxx' : row.phone;
                    row.address = '<small>'+row.address.toUpperCase()+'</small>';	
                    row.index_number = '<small><b>'+row.index_number+'</b></small>';                    
              }
              return row;
        }));
              
        res.json({
            draw : Number(params.draw),
            recordsTotal : Number(rowsTot.length),
            recordsFiltered : Number(rowsTot.length),
            data: data
        });        
       
     });





    /* Financial Module */

     // Bills -- Page
     app.get('/bill/list',isAuthenticated,(req,res) => {  
        // Check Session
        if(req.session.user == null){
          res.redirect('/');
        } 

        let msg = req.query.msg || '';         
        conn((err,db) => {        
            db.query("select DATE_FORMAT(b.date,'%d/%m/%Y') as sdate, a.name as academs,b.* from bill b left join academ a on a.academ = b.academ order by b.id desc",(err,rows)=>{
                rows.map((row,i)=>{                  
                    db.query("select * from transact where action = 'C' and bill = "+row.id,(err,rex)=>{                                                           
                        rows[i].status = rex.length;
                        console.log(rows);
                        if(i == rows.length - 1){
                            res.render('index.ejs',{
                                parent: 'eJHS',
                                view  : 'listbill',
                                title : 'Terminal Bills',
                                rows : rows, //status : res.length,
                                msg: msg,
                                session: req.session.user,settings
                            });   
                            console.log(rows);
                        }
                    }); 
                });
                db.release(); 
           });           
       });
    });


    // Bill -- Add or Create
    app.get('/bill/add',isAuthenticated,(req,res) => { 
        conn((err,db)=>{
            db.query("select * from academ;",(err,rows)=>{
                res.render('index.ejs',{
                    parent: 'Finance',
                    view  : 'addbill',
                    title : 'Add Bill',
                    row:{id:0},academs: rows,
                    session: req.session.user,settings
                });
                db.release(); 
            });
        });        
    });


    // Students -- Edit Student
    app.get('/bill/edit/:id',isAuthenticated,(req,res) => { 
        let id = req.params.id;
        conn((err,db)=>{
            db.query("select * from bill where id = "+id+";select * from academ",(err,rows)=>{
                res.render('index.ejs',{
                    parent: 'Finance',
                    view  : 'addbill',
                    title : 'Edit Bill',
                    row: rows[0][0],academs: rows[1],
                    session: req.session.user,settings
                });
                db.release(); 
            });
        });        
    });


    // Bill -- Edit 
    app.get('/bill/del/:id',isAuthenticated,(req,res) => { 
        let id = req.params.id;
        conn((err,db)=>{
            db.query("delete from bill where id = "+id+";delete from transact where bill = "+id,(err,rows)=>{
                res.redirect('/bill/list?msg=deleted'); 
                db.release(); 
            });
        });        
    });

     
    

    // Bill -- Post Form - Insert
    app.post('/bill/post',(req,res)=>{
        let data = req.body;
        let id = req.body.id;   
       
            conn((err,db) => { 
                if(id <= 0){
                    data.date = new Date();
                    db.query("insert into bill set ?",data,(err,rows)=>{
                        if(err) throw(err);
                        res.redirect('/bill/list?msg=saved',);
                    });
                }else{
                    db.query("update bill set ? where id ="+id,data,(err,rows)=>{
                        if(err) throw(err);
                        res.redirect('/bill/list?msg=saved');                        
                    });
                }
                db.release(); 
            });             
    });




    // Bill -- Send Bill
    app.get('/bill/send/:id',isAuthenticated,(req,res)=>{
        let id = req.params.id;              
        conn((err,db) => {        
            db.query("select b.*,a.name as academs from bill b left join academ a on a.academ = b.academ where b.id = "+id,(err,rows)=>{
                const groups =  rows[0].groups.split(',');
                console.log(rows);console.log(groups);
                groups.map((group,i)=>{
                    console.log(group);               
                    let cs = db.query("select s.* from student s inner join `groups` g on s.year_group = g.id where g.name = '"+group+"'",(err,rex)=>{                                                           
                        console.log(cs.sql);                        
                        rex.map((rem,i) => {
                           // Insert Data into Students Account
                           const data = {action:'C', amount:(rem.residential_status == 'RESIDENTIAL'? rows[0].bamount:rows[0].damount), date: new Date(), bill:id, index_number:rem.index_number,academ:rows[0].academ, active:'1'}
                           db.query("insert into transact set ?",data,(err,red)=>{
                                 console.log(red);                                
                           });
                        });
                       
                    }); 
                });

                res.redirect('/bill/list?msg=sent');
                db.release();                  
           });
       });
            
    });



    // Bill -- Revoke Bill
    app.get('/bill/revoke/:id',isAuthenticated,(req,res)=>{
        let id = req.params.id;              
        conn((err,db) => {        
            db.query("delete from transact where action = 'C' and bill = "+id,(err,rows)=>{
                res.redirect('/bill/list?msg=revoked');
                db.release();               
             }); 
       });            
    });



     // Bill -- XSend/ X-Post
     app.get('/bill/xsend/:id/:data',(req,res)=>{
        let id = req.params.id; let data = req.params.data;              
        conn((err,db) => {        
            db.query("select b.*,a.name as academs from bill b left join academ a on a.academ = b.academ where b.id = "+id,(err,rows)=>{
                const studs =  data.split('__');               
                studs.map((stud,i)=>{
                    console.log(stud); 
                    const indexno = (stud.split('_')).join('/');              
                    let cs = db.query("select * from student where index_number = '"+indexno+"'",(err,std)=>{                                                           
                        console.log(cs.sql);  
                        if(err) console.log(err);
                        if(std.length > 0){                      
                            std.map((rem,i) => {
                                // Check If Bill Posted Against Student
                                db.query("select * from transact where bill = "+id+" and index_number = '"+indexno+"'",data,(err,red)=>{
                                    if(err) console.log(err); 
                                    if(red.length == 0){ 
                                           // Insert Data into Students Account
                                            const data = {action:'C', amount:(std[0].residential_status == 'RESIDENTIAL'? rows[0].bamount:rows[0].damount), date: new Date(), bill:id, index_number:indexno,academ:rows[0].academ, active:'1'}
                                            db.query("insert into transact set ?",data,(err,red) => {
                                                    console.log(red);                                
                                            });
                                    }                              
                                });
                            
                            });
                        }
                       
                    }); 
                });

                res.redirect('/bill/list?msg=sent');
                db.release();                  
           });
       });
            
    });

     // Bill -- Print All
     app.get('/bill/view/:id',async(req,res) => { 
        let id = req.params.id.split('_').join('/'); 
        var bill = await dbx.query("select b.*,a.* from bill b left join academ a on a.academ = b.academ where b.id = "+id);                
        res.render('report/bs.ejs',{
            parent: 'eJHS',           
            title : 'Print Bill',
            bill:bill[0],
            session: req.session.user,settings
        });                
    });


    // Bill -- Print All
    app.get('/bill/print/:id',async(req,res) => { 
        let id = req.params.id.split('_').join('/'); 
        let bill = await dbx.query("select b.*,a.* from bill b left join academ a on a.academ = b.academ where b.id = "+id); 
        let filter = await dbx.query("select distinct(t.index_number) from transact t where t.bill = "+id);
        console.log(`bill: `);
        console.log(bill);
        let rows = await Promise.all(filter.map(async(filt,i,array) => {
            var row = await dbx.query("select DATE_FORMAT(s.dob,'%Y/%m/%d') as dobs,s.*,p.name as program,h.name as hall,g.level,p.prefix from student s left join program p on s.program_id = p.id left join hall h on s.hall_id = h.id left join `groups` g on s.year_group = g.id where s.academic_status = 'ACTIVE' and s.index_number = '"+filt.index_number+"'");
            row[0].bill = bill.length > 0 ? bill[0] : '';
            return row[0];
            console.log(row);
        }));       
        res.render('report/bsx.ejs',{
            parent: 'eJHS',           
            title : 'Print Bill',
            data :   rows,
            session: req.session.user,settings
        });                   
    });






    // Debtors -- Page
    app.get('/debt/list',isAuthenticated,(req,res) => {  
        let msg = req.query.msg || '';         
        conn((err,db) => {                    
            db.query("select distinct(t.index_number),concat(s.fname,' ',s.lname,'<br/><small><b>-- ',s.index_number,'</b></small>') as student,s.* from transact t left join student s on t.index_number = s.index_number",(err,rows)=>{
                if(err) console.log(err);
                if(rows.length > 0 ){
                        rows.map((row,i) => {  
                            db.query("select t.*,b.min_pay from transact t left join bill b on t.bill = b.id where t.action = 'C' and t.index_number = '"+row.index_number+"' order by id desc limit 1; select sum(amount) as debt from transact where action = 'C' and index_number = '"+row.index_number+"'; select sum(amount) as paid from transact where action = 'D' and index_number = '"+row.index_number+"'; select *,DATE_FORMAT(date,'%Y-%m-%d') as paydate from transact where action = 'D' and bill >= 0 and index_number = '"+row.index_number+"' order by id desc; select sum(amount) as bal from transact where action = 'D' and bill < 0 and index_number = '"+row.index_number+"'; select sum(amount) as arrears from transact where action = 'C' and bill < 0 and index_number = '"+row.index_number+"';",(err,rex)=>{                                                           
                                    if(err) console.log(err);                         
                                    //console.log(rex[0]);
                                    //console.log(rows[0]);
                                    const cur_bill = rows[i].cur_bill = rex[0].length > 0 ? rex[0][0].amount : 0;
                                    const cur_minpay = rows[i].cur_minpay = rex[0].length > 0 ? rex[0][0].min_pay : 0;
                                    const debt = rows[i].debt = (rex[1][0].debt - cur_bill) || 0;
                                    const paid = rows[i].paid = rex[2][0].paid || 0;
                                    const bal = rows[i].bal = debt - paid;
                                    const charge = rows[i].charge = cur_bill + debt;
                                    const tbal = rows[i].tbal = charge - paid;
                                    const lpay = rows[i].lpay = (rex[3].length > 0 ? rex[3][0].amount : 0);
                                    const ldate = rows[i].ldate = (rex[3].length > 0 ? rex[3][0].paydate : '');
                                    const mbal = rows[i].mbal = rex[4][0].bal || 0;
                                    const mdebt = rows[i].mdebt =  rex[5][0].arrears || 0;


                                        if(i == rows.length - 1){
                                        res.render('index',{
                                                parent: 'Finance',
                                                view  : 'listdebt',
                                                title : 'Accounts & Debts',
                                                rows : rows,
                                                msg: msg,
                                                session: req.session.user,settings
                                            });                            
                                        }
                            }); 
                        });
                    }else{
                        res.render('index',{
                            parent: 'Finance',
                            view  : 'listdebt',
                            title : 'Accounts & Debts',
                            rows : null,
                            msg: msg,
                            session: req.session.user,settings
                        });    
                    }
                db.release();  
           });
       });
    });




    // Payment -- Page

    app.get('/pay/list',isAuthenticated,(req,res) => {
            let msg = req.query.msg || '';         
        /**/
        conn((err,db) => {                    
            db.query("select t.id as tid,r.username,DATE_FORMAT(t.date,'%Y-%m-%d') as pdate,concat(s.fname,' ',s.lname,'<br/><small><b>-- ',s.index_number,'</b></small>') as student,s.*,t.*,b.* from transact t left join student s on t.index_number = s.index_number left join user r on r.id = t.receiver left join bill b on t.bill = b.id where t.action = 'D' and t.bill >= 0 order by t.index_number,t.id desc",(err,rows)=>{
                    res.render('index.ejs',{
                        parent: 'Finance',
                        view  : 'listpay',
                        title : 'Payment Module',
                        rows : rows,
                        msg: msg,
                        session: req.session.user,settings
                    });  
                    db.release();                       
            });
       });       
    });

    // AJAX : Payment Step 1
    app.get('/pay/step1',(req,res) => {            
        res.render('ajax/pay1');
    });

    // AJAX : Payment Step 1
    app.get('/pay/step2',(req,res) => {  
        const data = req.query.data;  
        console.log(data);   
        conn((err,db) => {                    
            db.query("select p.name as program,g.name as classname,s.* from student s left join program p on p.id = s.program_id left join `groups` g on g.id = s.year_group where index_number = '"+data+"' or fname like '%"+data+"%' or lname like '%"+data+"%' or concat(fname,' ',lname) like '%"+data+"%'; select * from academ where active = '1'",(err,rows)=>{
                if(err) console.log(err);
                const status = (rows[0].length == 0) ? false : true;
                if(status){
                    res.render('ajax/pay2',{                      
                        sl : rows[0],status
                    }); 
                }else{
                    res.render('ajax/pay2',{                      
                        status
                    });  
                }
            });
        //res.render('ajax/pay2');
        });
    });

    // AJAX : Payment Step 1
    app.get('/pay/step3',(req,res) => {  
        const data = req.query.data;  
        conn((err,db) => {                    
            db.query("select p.name as program,g.name as classname,s.* from student s left join program p on p.id = s.program_id left join `groups` g on g.id = s.year_group where index_number = '"+data+"' or fname like '%"+data+"%' or lname like '%"+data+"%' or concat(fname,' ',lname) like '%"+data+"%'; select * from academ where active = '1'",(err,rows)=>{
                if(err) console.log(err);
                const status = (rows[0].length == 0) ? false : true;
                
                if(status){
                        db.query("select * from transact where action = 'C' and index_number = '"+data+"' order by id desc; ", (err,rexs)=>{
                            //let tbal = bal(db,data);
                            // Calculate Balance
                            let row = {};        
                            db.query("select t.*,b.min_pay from transact t left join bill b on t.bill = b.id where t.action = 'C'  and t.index_number = '"+data+"' order by t.id desc limit 1; select sum(amount) as debt from transact where action = 'C' and index_number = '"+data+"'; select sum(amount) as paid from transact where action = 'D' and index_number = '"+data+"'",(err,rex)=>{                                                           
                                if(err) console.log(err);                       
                                        console.log(rex[0].length);
                                        const cur_bill = row.cur_bill =  (rex[0].length > 0 ? rex[0][0].amount : 0);
                                        const cur_minpay = row.cur_minpay = (rex[0].length > 0 ? rex[0][0].min_pay : 0);
                                        const debt = row.debt = (rex[1][0].debt - cur_bill) || 0;
                                        const paid = row.paid = rex[2][0].paid || 0;
                                        const bal = row.bal = debt - paid;
                                        const charge = row.charge = cur_bill + debt;
                                        const tbal = row.tbal = charge - paid;
                                        const bill = (rexs.length > 0 ? rexs[0] : 0);
                                         console.log(row);                         
                                        // return rows; 
                                        res.render('ajax/pay3',{                      
                                            sl : rows[0][0], academ : rows[1][0], bill : bill,tbal,charge,min:cur_minpay,status
                                        }); 
                                db.release();
                            });                                             
                        });
                        
                }else{
                    res.render('ajax/pay3',{                      
                        status
                    });  
                }
            });
        //res.render('ajax/pay2');
        });
    });


    // Post Step 2 -- Payment Form
    app.post('/pay/postpay',(req,res) => {
        let draft_no = Math.ceil(Math.random()*1000000);
        let data = {index_number:req.body.index_number,amount:req.body.amount,receipt_no:req.body.receipt_no,draft_no,academ:req.body.academ,bill:req.body.bill,date:new Date(),action:'D',active:'1',receiver: req.session.user.id}; 
        conn((err,db) => {                    
            db.query("insert into transact set ?",data,(err,rows)=>{
                if(err) throw(err);
                res.redirect('/pay/list');
                db.release(); 
            });
        });        
    });


    // Post Arrears -- Payment Form
    app.get('/pay/addebt/:amount/:id',isAuthenticated,async(req,res) => {
        let amount = req.params.amount;
        let id = req.params.id.split('_').join('/');
        let row = await dbx.query("select * from student where index_number = '"+id+"'");
        let academ = await dbx.query("select * from academ where active = '1'");
        let data = {index_number: row[0].index_number, amount:amount, academ: academ[0].academ, date:new Date(), action:'C', active:'1',bill:-1}; 
        dbx.query("insert into transact set ?",data);
        res.redirect('/pay/list');                   
    });

    // Post Balance -- Payment Form
     app.get('/pay/addbal/:amount/:id',isAuthenticated,async(req,res) => {
        let amount = req.params.amount;
        let id = req.params.id.split('_').join('/');
        let row = await dbx.query("select * from student where index_number = '"+id+"'");
        let academ = await dbx.query("select * from academ where active = '1'");
        let data = {index_number: row[0].index_number, amount:amount, academ: academ[0].academ, date: new Date(), action:'D', active:'1',bill:-1}; 
        dbx.query("insert into transact set ?",data);
        res.redirect('/pay/list');                      
    });


    // Payment -- Delete 
    app.get('/pay/del/:id',isAuthenticated,(req,res) => {
        let id = req.params.id;
        conn((err,db) => {                    
            db.query("delete from transact where id ="+id,(err,rows) =>{
                if(err) throw(err);
                res.redirect('/pay/list');
                db.release(); 
            });
        });        
    });


    // Receipt of Payments
    app.get('/receipt/:id',async(req,res) => {
        let id = req.params.id;
        let row = await dbx.query("select g.name as gname,j.name as prog,s.*,concat(u.fname,' ',u.lname) as receivers,DATE_FORMAT(t.date,'%M %d, %Y') as issued,DATE_FORMAT(t.date,'%d %M, %Y') as tdate,t.*,b.bill from transact t left join bill b on t.bill = b.id left join student s on t.index_number = s.index_number left join `groups` g on s.year_group = g.id left join program j on g.program_id = j.id left join user u on u.id = t.receiver where t.id ="+id);
        res.render('report/pslip',{row:row[0],settings});
    });

     // Statement of Transactions
     app.get('/transact/:id',async(req,res) => {
        let id = req.params.id.split('_').join('/');
        let rows = await dbx.query("select g.name as gname,j.name as prog,s.fname,s.lname,DATE_FORMAT(t.date,'%M %d, %Y') as issued,DATE_FORMAT(t.date,'%d %M, %Y') as tdate,t.*,b.bill,s.photo from transact t left join bill b on t.bill = b.id left join student s on t.index_number = s.index_number left join `groups` g on s.year_group = g.id left join program j on g.program_id = j.id where t.index_number ='"+id+"'");
        console.log(rows);
        if(rows.length>0){
            res.render('report/ts',{rows,settings});
        }else{
            res.redirect("/student/list?msg=nots")
        }       
    });


    // Registration -- Page
    app.get('/reg/list',isAuthenticated,async(req,res) => {
        // Check Session
        if(req.session.user == null){
            res.redirect('/');
        }

         let msg = req.query.msg || '';                    
         let rows = await dbx.query("select distinct(t.index_number),s.*,concat(s.fname,' ',s.lname,'<br/><small><b>-- ',s.index_number,'</b></small>') as student,DATE_FORMAT(t.date_registered,'%Y-%m-%d') as regdate,p.name as program from link t left join student s on s.index_number = t.index_number left join program p on s.program_id = p.id order by t.id desc,t.index_number");
        console.log('REGISTRATION');       
        if(rows.length > 0){
                res.render('index.ejs',{
                    parent: 'Registration',
                    view  : 'listreg',
                    title : 'Registration Module',
                    rows : rows,
                    msg: msg,
                    session: req.session.user,settings
                });                                            
                
         }else{
                res.render('index.ejs',{
                    parent: 'Registration',
                    view  : 'listreg',
                    title : 'Registration Module',
                    rows : null,
                    msg: msg,
                    session: req.session.user,settings
                }); 
         }         
    });


    
     // AJAX : Registration Step 1
     app.get('/reg/step1',(req,res) => {            
        res.render('ajax/reg1');
     });

     // AJAX : Registration Step 2
     app.get('/reg/step2', async (req,res) => {  
        const data = req.query.data;                    
        var rows = await dbx.query("select g.allow_register as rallow,g.semester as cursem,p.name as program,s.* from student s,program p,`groups` g where s.year_group = g.id and p.id = s.program_id and index_number  = '"+data+"'; select * from academ where active = '1'");
        
        const status = (rows[0].length == 0) ? false : true;
        if(status){
                var rexs = await dbx.query("select * from link where academ = '"+rows[1][0].academ+"' and index_number = '"+data+"'; select * from hall; select * from program where id = '"+rows[0][0].program_id+"'");
                const reg = (rexs[0].length == 0) ? false : true;
                if(!reg){
                        var rex = await dbx.query("select t.*,b.min_pay from transact t left join bill b on t.bill = b.id where t.action = 'C' and t.index_number = '"+data+"' order by t.id desc limit 1; select sum(amount) as debt from transact where action = 'C' and index_number = '"+data+"'; select sum(amount) as paid from transact where action = 'D' and index_number = '"+data+"'");                                                          
                        let row = {};         
                        // Calculate Balance
                        const cur_bill = row.cur_bill =  (rex[0].length > 0 ? rex[0][0].amount : 0);
                        const cur_minpay = row.cur_minpay = (rex[0].length > 0 ? rex[0][0].min_pay : 0);
                        const debt = row.debt = (rex[1][0].debt - cur_bill) || 0;
                        const paid = row.paid = rex[2][0].paid || 0;
                        const bal = row.bal = debt - paid;
                        const charge = row.charge = cur_bill + debt;
                        const tbal = row.tbal = charge - paid;                                
                                                
                        // Get Courses for Semester
                        let crs = rexs[2][0].link.split(';');
                        let progkey = null; 
                        //console.log(crs);
                        crs.map(async (cr) => {
                            let all = cr.split(':');
                            let sem = all[0];

                            if(sem == rows[0][0].cursem){

                                progkey = all[1]; 
                                let courses = (all[1].trim()).split(',');          
                                var cts = await Promise.all(courses.map(async (course,i,array) => {  
                                    try{
                                        let cs = await dbx.query("select * from course where code = '"+course+"'");                        
                                        return cs[0];
                                    }catch(e){
                                        console.log(e);
                                    }                                                                         
                                })); 
                                        
                                // If Student Exists & Not-Registered
                                res.render('ajax/reg2',{                      
                                    status, sl : rows[0][0], academ : rows[1][0],tbal,charge,min:cur_minpay,
                                    link:rexs[0], hall:rexs[1], prog:rexs[2][0], courses:cts, progkey,reg,tbal,min:cur_minpay
                                });                   
                            }
                        }); 

                    }else{ // If Student Exists & Registered
                        res.render('ajax/reg2',{status,sl : rows[0][0], academ : rows[1][0],reg});
                    }                
        }else{ // If Student Doesnt Exists
            res.render('ajax/reg2',{status}); 
        }                            
    });



    // Registration Step 2 -- Registration Procedure
    app.post('/reg/postreg',async(req,res) => {
          
                // Post courses into link table 
                let courses = req.body.progkey.split(',');
                courses.forEach(async(course)=>{
                    var scheme = await dbx.query("select * from scheme where active = '1'");
                    var rows = await dbx.query("select * from link where academ = '"+req.body.academ+"' and index_number = '"+req.body.index_number+"' and course_code = '"+course+"'; select * from course where code = '"+course+"'");
                    let data = {course_code:course, scheme: scheme[0].id, index_number: req.body.index_number, academ : req.body.academ, group_id : req.body.year_group,semester: req.body.semester, hours: rows[1][0].hours, enabled : '1'};
                    if(rows[0].length <= 0 && rows[1].length > 0){                         
                         await dbx.query("insert into link set ?",data);
                         console.log("INSERT LINK");                                                  
                    }else{
                         await dbx.query("update link set ? where academ = '"+req.body.academ+"' and index_number = '"+req.body.index_number+"' and course_code = '"+course+"'",data);
                         console.log("UPDATE LINK");                                                
                    }                                 
                });                
                
                // Update Student Residential status and Hall status	                
                    await dbx.query("update student set residential_status = '"+req.body.residential_status+"' where index_number = '"+req.body.index_number+"'");
                    await dbx.query("update student set hall_id = '"+req.body.hall_id+"' where index_number = '"+req.body.index_number+"'");
            
                // Assign Feeding NUmber               
                var rows = await dbx.query("select * from feeding where academ = '"+req.body.academ+"' and user = '"+req.body.index_number+"' and group_id = '"+req.body.year_group+"'; select * from feeding where academ = '"+req.body.academ+"' and user IS NULL and group_id = '"+req.body.year_group+"'");
                
                if(rows[0].length <= 0 && rows[1].length > 0 ){ 
                    console.log('UPDATE : FEEDING');                                      
                    await dbx.query("update feeding set user = '"+req.body.index_number+"' where id = "+rows[1][0].id);
                }else{
                    // Feeding Numbers Exhausted for Group, Generate One for Student
                    var rex = await dbx.query("select * from feeding where academ = '"+req.body.academ+"' order by id desc limit 1; select * from academ where active = '1'; select * from `groups` where id = "+req.body.year_group);
                    var lcode = (parseInt(rex[0][0].card_no.substring(3,7))+10001).toString().substring(1,5);
                    var tcode = 'FDN'+ lcode;
                    let data = {academ:req.body.academ ,card_no:tcode ,date_added:new Date(), user:req.body.index_number, group_id:req.body.year_group, remark:'Feeding Card for '+rex[2][0].name+' in Semester '+req.body.semester+', '+rex[1][0].name+' Academic Year'};
                    await dbx.query("insert into feeding set ?",data);    
                    console.log('INSERT : FEEDING');                
                }

                // Assign Bed Slot                 
                let stud = await dbx.query("select * from student where index_number = '"+req.body.index_number+"'");             
                let beds = await dbx.query("select b.*,r.groups,r.capacity from bedx b left join roomx r on b.room_id = r.id where b.user IS NULL and b.academ = '"+req.body.academ+"' order by b.room_id asc; select * from bedx where user = '"+req.body.index_number+"' and academ ='"+req.body.academ+"'");  
                if(beds[1].length == 0){
                    for(var bed of beds[0]){                                                           
                        if((stud[0].gender == bed.gender) && bed.groups.trim() != ''){
                            let bdx = bed.groups.trim().split(',');
                            let exist = bdx.filter((val) =>{                               
                                console.log(val+' | '+stud[0].year_group);
                                 return Number(val) === Number(stud[0].year_group);
                            });
                        
                            //console.log(bed.groups);
                            //console.log("FOUND GROUP:");                            
                            //console.log(exist);

                            //if(stud[0].year_group == req.session.bedexist){
                            if(stud[0].year_group == Number(exist)){                               
                                // Assign Bed Number to Student
                                await dbx.query("update bedx set user = '"+req.body.index_number+"', group_id = "+stud[0].year_group+", mattress = '"+req.body.mattress+"', occupied = '1' where id ="+bed.id);
                                // Slots Occupied fully for Room !
                                let slots = await dbx.query("select count(*) as num from bedx where room_id = "+bed.room_id+" and academ = '"+req.body.academ+"' and occupied = '1'");
                                if(slots.length > 0 && (bed.capacity) == slots[0].num){
                                    await dbx.query("update roomx set occupied = '1' where id = "+bed.room_id);
                                } 
                                //console.log('BED | GROUP : '+req.body.index_number);
                                break;
                            }

                        }else if((stud[0].gender == bed.gender) && bed.groups.trim() == ''){
                            // Assign Bed Number to Student
                            await dbx.query("update bedx set user = '"+req.body.index_number+"', group_id = "+stud[0].year_group+", occupied = '1' where id ="+bed.id);
                            // Slots Occupied fully for Room !
                            let slots = await dbx.query("select count(*) as num from bedx where room_id = "+bed.room_id+" and academ = '"+req.body.academ+"' and occupied = '1'");
                            if(slots.length > 0 && (bed.capacity) == slots[0].num){
                                await dbx.query("update roomx set occupied = '1' where id = "+bed.room_id);
                            } 
                            //console.log('BED | NOGROUP : '+req.body.index_number);
                            break;
                        }
                    }
                }
                res.redirect('/reg/list');                
    });



    // Print Registration Slip 
    app.get('/reg/slip/:id',async(req,res) => {
        let id = req.params.id;
        let stud = await dbx.query("select s.*,b.*,r.room,f.card_no,g.name as gname,p.name as prog from student s left join bedx b on b.user = s.index_number left join roomx r on r.id = b.room_id left join feeding f on s.index_number = f.user left join `groups` g on s.year_group = g.id left join program p on p.id = s.program_id where s.id ="+id);
        let academ = await dbx.query("select * from academ where active = '1'");
        let rows = await dbx.query("select  l.*,c.name from link l left join course c on l.course_code = c.code where index_number = '"+stud[0].index_number+"' and academ = "+academ[0].academ);
        
        res.render('report/slip',{
            rows,stud:stud[0],academ:academ[0],session: req.session.user,settings
        });                       
    });


     // Restage Registration 
     app.get('/reg/restage/:id/:academ',isAuthenticated,async(req,res) => {
        let id = req.params.id.split('_').join('/');
        let academ = req.params.academ;
        // Delete Courses in link table
        await dbx.query("delete from link where academ = '"+academ+"' and index_number = '"+id+"'"); 
        // Un-assign Feeding NUmber
        let fno = await dbx.query("select * from feeding where user = '"+id+"' and academ = '"+academ+"'");
        if(fno.length > 0){
            await dbx.query("update feeding set user = NULL where id = "+fno[0].id);
        }
         
        // Un-assign Bed of Student        
        let beds = await dbx.query("select r.*,b.id as bid from bedx b left join roomx r on r.id = b.room_id where user = '"+id+"'");
        //console.log(beds);
        if(beds.length > 0){
            beds.forEach(async(bed)=>{
                await dbx.query("update bedx set user = NULL, group_id = 0, occupied = '0' where id = "+bed.bid);
                let slots = await dbx.query("select count(*) as num from bedx where room_id = "+bed.room_id+" and academ = '"+academ+"' and occupied = '1'");
                if(slots.length > 0 && (room[0].capacity) == slots[0].num){
                await dbx.query("update roomx set occupied = '1' where id = "+bed.room_id);
                }else{
                await dbx.query("update roomx set occupied = '0' where id = "+bed.room_id);
                } 
            });
        }     
        console.log(id);
        res.redirect('/reg/list');             
    });







    /* ROOM PAGE */

    // Rooms -- Page

    app.get('/room/list',isAuthenticated,async(req,res) => {
        // Check Session
        if(req.session.user == null){
            res.redirect('/');
          } 

        let msg = req.query.msg || '';   
        let std = await dbx.query("select r.*,g.name as gname,h.name as hall from roomx r left join `groups` g on g.id IN (r.groups) left join hall h on h.id = r.hall_id");
     
        let stdx = await Promise.all(std.map(async(st,i,array) =>{
            var sm = st; var groups = st.groups.split(',');

            let gs = await Promise.all(groups.map(async(group,i,array) => {
                let data = await dbx.query("select * from `groups` where id = '"+group+"'");
                return data[0];                
            }));
            
            let data =  gs.reduce((acc,cur,i)=>{
                return (i == 0 ? (acc) : (acc+","+cur.name));
            },st.gname);

            sm.groups = gs.length == 1 ? st.gname : data;
            return sm;    
           // console.log(data);        
        }));    

        res.render('index.ejs',{
            parent: 'Accomodation',
            view  : 'listro',
            title : 'Rooms',
            rows : stdx,
            msg: msg,
            session: req.session.user,settings
        });         
    });


    // Room -- Add or Create
    app.get('/room/add',isAuthenticated,async(req,res) => { 
        let rows = await dbx.query("select * from hall");
        res.render('index.ejs',{
            parent: 'Accomodation',
            view  : 'addro',
            title : 'Add Room',
            row:{id:0},halls: rows,
            session: req.session.user,settings
        });                        
    });


    // Room -- Edit Room
    app.get('/room/edit/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;        
        let rows = await dbx.query("select * from roomx where id = "+id+";select * from hall");
        res.render('index.ejs',{
            parent: 'Accomodation',
            view  : 'addro',
            title : 'Edit Room',
            row: rows[0][0],halls: rows[1],
            session: req.session.user,settings
        });                        
    });


    
    // Room -- Generate Room 
    app.get('/room/generate/',isAuthenticated,async(req,res)=>{
       
        // Get Current Academic Semester
        let academ = await dbx.query("select * from academ where active = '1'"); 
        let pacadem = await dbx.query("select * from academ where id = "+(academ[0].id - 1));  

        // Get Rooms
        let rooms = await dbx.query("select * from roomx where active = '1' and academ = '"+academ[0].academ+"'; select * from roomx where active = '1' and academ = '"+pacadem[0].academ+"'");
        if(rooms[0].length == 0 && rooms[1].length > 0){
            rooms[1].forEach(async(room)=>{ 
                let data = {academ:academ[0].academ, groups:room.groups, room : room.room, occupied :'0', gender: room.gender, capacity: room.capacity};
                await dbx.query("insert into roomx set ?",data);
           });        
        }
        res.redirect('/room/list?msg=success');                
    });



    // Room -- Delete 
    app.get('/room/del/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;        
        await dbx.query("delete from roomx where id = "+id+"; delete from bedx where room_id = "+id);
        res.redirect('/room/list?msg=deleted');                         
    });     
    

    // Room -- Post Form - Insert
    app.post('/room/post',async(req,res)=>{
        let data = req.body;
        let id = req.body.id;   
        
        if(id <= 0){
            data.date = new Date();
            await dbx.query("insert into roomx set ?",data);               
            res.redirect('/room/list?msg=saved');           
        }else{
            await dbx.query("update roomx set ? where id ="+id,data);
            res.redirect('/room/list?msg=saved'); 
        }                   
    });



    // Room -- Assign Bed From this Room
    app.get('/room/assign/:id/:index',isAuthenticated,async(req,res)=>{
        let id = req.params.id; 
        let index = req.params.index.split('_').join('/');
        
        // Get Current Academic Semester
        let academ = await dbx.query("select * from academ where active = '1'");        
        // Get Student
        let stud = await dbx.query("select * from student where index_number = '"+index+"'");             
        // Get Room
        let room = await dbx.query("select * from roomx where active = '1' and id = "+id);
        // Check Available Bed in Room
        let beds = await dbx.query("select * from bedx where user IS NULL and room_id = "+id+" and academ = '"+academ[0].academ+"'");  
        
        if(stud.length == 0){
            res.redirect('/room/list?msg=nouser');
        }else if(stud[0].gender !== room[0].gender){
            res.redirect('/room/list?msg=badsex');
        }else if(!room[0].groups.includes(stud[0].year_group)){
            res.redirect('/room/list?msg=badgroup');
        }else{
            if(beds.length > 0){
                // Assign Bed Number to Student
                await dbx.query("update bedx set user = '"+index+"', group_id = "+stud[0].year_group+", gender = '"+stud[0].gender+"' where id ="+beds[0].id);
                res.redirect('/room/list?msg=assigned');

                // Slots Occupied fully for Room !
                let slots = await dbx.query("select count(*) as num from bedx where room_id = "+room[0].id+" and academ = '"+academ[0].academ+"' and occupied = '1'");
                if(slots.length > 0 && (room[0].capacity*2) == slots[0].num){
                   await dbx.query("update roomx set occupied = '1' where id = "+room[0].id);
                }    
            
            }else{
                res.redirect('/room/list?msg=nobed');
            } 
        }                 
    });




    /* BED PAGE */
 
    // Assigned Bed -- Page

    app.get('/bed/list',isAuthenticated,async(req,res) => {
        // Check Session
        if(req.session.user == null){
            res.redirect('/');
          } 

        let msg = req.query.msg || ''; 
        let academ = await dbx.query("select * from academ where active = '1'");
        let std = await dbx.query("select b.gender,concat(s.fname,' ',s.lname,'<br/><small><b>-- ',s.index_number,'</b></small>') as student, b.*,r.room,g.name as gname from bedx b left join roomx r on b.room_id  = r.id left join `groups` g on b.group_id = g.id left join student s on b.user = s.index_number where b.academ = '"+academ[0].academ+"' order by r.id,b.indexes asc");
        res.render('index.ejs',{
            parent: 'Accomodation',
            view  : 'listbed',
            title : 'Beds',
            rows : std,
            academ : academ[0],
            msg: msg,
            session: req.session.user,settings
        });         
    });



     // Bed -- Unassign 
     app.get('/bed/unassign/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id; 
        // Get Current Academic Semester
        let academ = await dbx.query("select * from academ where active = '1'");        
        // Get Room
        let room = await dbx.query("select r.* from bedx b left join roomx r on r.id = b.room_id where b.id = "+id);
        // Reset Bed Slot      
        await dbx.query("update bedx set user = NULL, group_id = 0, occupied = '0' where id = "+id);
        // Check Room Occuppied Status !
        let slots = await dbx.query("select count(*) as num from bedx where room_id = "+room[0].id+" and academ = '"+academ[0].academ+"' and occupied = '1'");
        if(slots.length > 0 && (room[0].capacity*2) == slots[0].num){
           await dbx.query("update roomx set occupied = '1' where id = "+room[0].id);
        } 
        res.redirect('/bed/list?msg=unassigned');                  
    }); 
    
    
    

    // Beds -- Generate Room Slots
    app.get('/bed/generate/',isAuthenticated,async(req,res)=>{       
        // Get Current Academic Semester
        let academ = await dbx.query("select * from academ where active = '1'");        
        // Get Rooms
        let rooms = await dbx.query("select * from roomx where active = '1' order by gender desc");
        j = 1;
        rooms.forEach(async(room)=>{          
           let capacity = room.capacity;
           let pos = true;
           let j = 2;
           console.log(room);
           console.log(capacity);

          for(var i = 1; i <= capacity; i++){
               let no = ((i%j) == 1 || (i%j) == 0) ? (i > 2 ? Math.ceil(i/2): 1) : 0;
               let indexes = pos ? 'D'+(Number(10000+no).toString()).substring(1,5) : 'T'+(Number(10000+no).toString()).substring(1,5);
               let data = {academ:academ[0].academ, indexes, room_id : room.id, occupied :'0', gender: room.gender};
               let existBed = await dbx.query("select * from bedx where academ = "+academ[0].academ+" and indexes = '"+indexes+"' and room_id ="+room.id);
               if(existBed.length == 0){
                   await dbx.query("insert into bedx set ?",data);
               } 
               pos = !pos;
               console.log(pos);
               console.log(i);
               console.log(indexes);
            }  
              
        });        
        res.redirect('/bed/list?msg=genbeds');                       
    });




    /* MATTRESS PAGE */
 

     // Bills -- Page
     app.get('/bill/list',isAuthenticated,(req,res) => {  
        // Check Session
        if(req.session.user == null){
            res.redirect('/');
          } 

        let msg = req.query.msg || '';         
        conn((err,db) => {        
            db.query("select b.*,DATE_FORMAT(b.date,'%d/%m/%Y') as sdate, a.name as academs from bill b inner join academ a on a.academ = b.academ",(err,rows)=>{
                rows.map((row,i)=>{                  
                    db.query("select distinct(bill),* from transact where action = 'C' and bill = "+row.id+" limit 1",(err,rex)=>{                                                           
                        rows[i].status = rex.length;
                        console.log(rows);
                        if(i == rows.length - 1){
                            res.render('index.ejs',{
                                parent: 'Finance',
                                view  : 'listbill',
                                title : 'Semester Bills',
                                rows : rows, //status : res.length,
                                msg: msg,
                                session: req.session.user,settings
                            });   
                            console.log(rows);
                        }
                    }); 
                });
                  
           });
           db.release(); 
       });
    });


    /* GROUPS */

    // Group -- Page
    app.get('/group/list',isAuthenticated,async(req,res) => { 
        // Check Session
        if(req.session.user == null){
            res.redirect('/');
          } 

        let msg = req.query.msg || '';         
        let rows = await dbx.query("select g.*,p.name as program,p.prefix from `groups` g left join program p on p.id = g.program_id where g.academic_status = 'ACTIVE'");
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'listgroup',
            title : 'CLASS',
            rows : rows, //status : res.length,
            msg: msg,
            session: req.session.user,settings
        });                      
    });

    // Group -- Add or Create
    app.get('/group/add',isAuthenticated,async(req,res) => { 
       let rows = await dbx.query("select * from program")
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'addgroup',
            title : 'Add Group',
            row:{id:0},programs: rows,
            session: req.session.user,settings
        });                       
    });


    // Group -- Edit Student
    app.get('/group/edit/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        let rows = await dbx.query("select * from `groups` where id = "+id+";select * from program");
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'addgroup',
            title : 'Edit Group',
            row: rows[0][0],programs: rows[1],
            session: req.session.user,settings
        });                       
    });


    
    // Group -- ID CARDS
    app.get('/group/gcard/:id',async(req,res) => { 
        let id = req.params.id;
        let rows = await dbx.query("select s.*,g.name as gname,p.name as prog,g.exit_year from student s left join program p on p.id = s.program_id left join `groups` g on g.id = s.year_group where s.year_group = "+id);
        if(rows.length > 0){
            var doc = new PDFDoc({          
                layout: 'portrait',
                size:[242.64,153],
                margins : { // by default, all are 72
                    top: 0, 
                    bottom: 0,
                    left: 0,
                    right: 0
                },          
                info: {
                    Title: rows[0].gname+' - ID CARDS', 
                    Author: settings.instituteShort, // the name of the author
                }
            }); 
            
            rows.map(row => {
                // FRONT - doc.addPage('landscape',[242.64,153])  
                doc.image('./public/card/front.jpg',0,0,{scale:0.24}) 
                doc.rect(0,0,242.64,55).fill(settings.primaryColor) // Top Rect
                doc.rect(0,150,242.64,55).fill(settings.primaryColor) // Bottom Rect
                doc.rect(80,48,80,12).fillAndStroke(settings.accentColor,settings.primaryColor) // Title Rect
                doc.image('./public/logo.jpg',10,8,{height:40})  // Logo
                doc.font('Helvetica-Bold').fontSize(10).fillColor(settings.accentColor).text(settings.instituteLong,58,10) // Institution Name
                doc.fontSize(6).fillColor(settings.secondColor).text(settings.instituteAddress.toUpperCase(),58,23) // Institution Address
                doc.font('Times-Italic').fontSize(6).fillColor(settings.accentColor).text("~ "+settings.instituteMotto,58,32) // Institution Motto
                doc.font('Helvetica-Bold').fontSize(7).fillColor(settings.primaryColor).text("STUDENT ID CARD",90,52) // ID Card title
                doc.image(row.photo ? '.'+row.photo:'./public/card/nopic.png',175,65,{width:60}) // Student Photo
                doc.font('Helvetica-Bold').fontSize(7).fillColor(settings.primaryColor).strokeColor(settings.accentColor).text('NAME: ',5,67) 
                doc.fontSize(7).text((row.fname+' '+row.lname).toUpperCase(),35,67)
                doc.fontSize(7).fillColor(settings.primaryColor).strokeColor(settings.accentColor).text('ID NUMBER: ',5,80) 
                doc.fontSize(8).text((row.index_number).toUpperCase(),55,80) 
                doc.fontSize(7).fillColor(settings.primaryColor).strokeColor(settings.accentColor).text('PROGRAM: ',5,93) 
                doc.fontSize(8).text((row.prog).toUpperCase(),55,93) 
                doc.fontSize(7).fillColor(settings.primaryColor).strokeColor(settings.accentColor).text('GENDER: ',5,107) 
                doc.fontSize(8).text((row.gender == 'M'?'MALE':'FEMALE').toUpperCase(),55,107) 
                // BACK -- ID CARD
                doc.addPage()
                //doc.image('./public/card/back.jpg',0,0,{scale:0.12}) 
                doc.rect(0,0,242.64,153)
                .fill("white").fillOpacity(0.10)
                doc.image('./public/logo.jpg',20,-20,{width:200})  // Logo 
                doc.rect(0,0,242.64,3).fill(settings.primaryColor).fillOpacity(1.0) // Top Rect
                doc.rect(0,0,242.64,3).fill(settings.primaryColor).fillOpacity(1.0) // Top Rect
                doc.rect(0,150,242.64,55).fill(settings.primaryColor).fillOpacity(1.0) // Bottom Rect
                doc.font('Times-Italic').fontSize(8).fillColor(settings.primaryColor).text(` If found, Please return to \n\n The Head Teacher,\n ${settings.instituteLong}\n${settings.instituteAddress}\n\n${settings.institutePhones}`,10,32,{align:'center'}) // Institution Motto
                doc.font('Helvetica-Bold').fontSize(8).text('EXPIRES ON OCTOBER, 2019', 60, 115)         
                //doc.addPage()

            });   
            
            doc.pipe(res);  
            doc.end()   
        }else{
            res.send("NO CLASS MEMBERS!")
        }                   
    });

    
     // Group -- Members
     app.get('/members/:id',async(req,res) => { 
        let id = req.params.id;
        let rows = await dbx.query("select s.*,g.name as gname,p.name as prog from student s left join `groups` g on s.year_group = g.id left join program p on p.id = g.program_id where s.academic_status = 'ACTIVE' and g.id = "+id);
        res.render('report/mcslip',{            
            title : 'MEMBERS',
            rows: rows,
            session: req.session.user,settings
        });                    
    });

    // Group -- Allow Register ( Administrative Privilege )
    app.get('/group/regadd/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        dbx.query("update student set allow_register = '1' where year_group = "+id);
        res.redirect('/group/list');                       
    });


    // Group -- CLASS RANKING
    app.get('/group/rank/:id',async(req,res) => { 
        let id = req.params.id;
        let rows = await dbx.query("select (sum(l.total)/count(l.total)) as avg,s.*,cm.*,cm.name as acad,p.name as prog,g.name as gname,l.index_number from `link` l left join `student` s on l.index_number = s.index_number left join `academ` cm on cm.academ = l.academ left join `program` p on p.id = s.program_id left join `groups` g on l.group_id = g.id where l.group_id = '"+id+"' group by l.index_number order by l.total desc");
        console.log(rows);
        if(rows.length > 0){
           res.render('report/pos.ejs',{
                parent: 'eJHS',           
                title : 'CLASS RANKING',
                rows,stat:1,
                session: req.session.user,settings
           });     
        }else{
            res.redirect('/group/list');
        }
                           
    });
 


    // Group -- Disallow Register ( Administrative Privilege )
    app.get('/group/regrem/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        dbx.query("update student set allow_register = '0' where year_group = "+id);
        res.redirect('/group/list');                    
    });



    // Group -- Edit 
    app.get('/group/del/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        await dbx.query("delete from `groups` where id = "+id);
        res.redirect('/group/list?msg=deleted');                      
    });     
    

    // Group -- Post Form - Insert
    app.post('/group/post',async(req,res)=>{
        let data = req.body;
        let id = req.body.id;        
        if(id <= 0){
            await dbx.query("insert into `groups` set ?",data)
            res.redirect('/group/list?msg=saved');            
        }else{
            await dbx.query("update `groups` set ? where id ="+id,data);
            res.redirect('/group/list?msg=saved');            
        }                           
    });


    // Calendar -- Register Student 
    app.get('/group/regcheck/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id.split('_').join('/');
        let ac = await dbx.query("select * from academ where active = '1'");
        let sts = await dbx.query("select s.*,g.level,p.*,g.name as gname,g.id as gid from student s left join `groups` g on s.year_group = g.id left join program p on g.program_id = p.id where s.academic_status = 'ACTIVE' and s.year_group = '"+id+"'");
        if(sts.length > 0){ 
            await sts.forEach(async st => {
                let lk = await dbx.query("select id,course_code from link where index_number = '"+st.index_number+"' and academ = '"+ac[0].academ+"'");
                let lm = st.link.split(',');                // Program Courses
                let lx = lk.map(x => x.course_code);        // All Registered Courses
                let dl = lm.filter(x => !lx.includes(x));   // Courses to Register from difference
                let il = lm.filter(x => lx.includes(x));    // Program Courses Registered
                let ml = lx.filter(x => !il.includes(x));   // Courses to Unregister (if any)
                console.log({structure : lm, all_registered : lx, to_register_diff1 : dl, structure_registered : il, to_unregister_diff2 : ml });
                // Courses to Unregister
                if(ml.length > 0){
                    for(var c of ml){ 
                        await dbx.query("delete from link where index_number = '"+st.index_number+"' and academ = '"+ac[0].academ+"' and course_code = '"+c+"'");
                    }
                }
                // Courses to Register
                if(dl.length > 0){
                    for(var c of dl){ 
                        let cs = await dbx.query("select * from course where code = '"+c+"'");                        
                        let rows = await dbx.query("select * from link where academ = '"+ac[0].academ+"' and index_number = '"+st.index_number+"' and course_code = '"+c+"'");
                        let data = {course_code:c, index_number: st.index_number, academ : ac[0].academ, group_id : st.year_group, scheme: st.scheme,semester: ac[0].term, enabled : '1',classx:(settings.appType == 1 ? st.prefix+st.level : st.level+st.prefix)};
                        (rows.length <= 0 && cs.length > 0) ? await dbx.query("insert into link set ?",data) : '';
                    }
                }
            })
        }
        res.redirect('/group/list?msg=saved');  
    });     



    /* COURSES */

    // Course -- Page
    app.get('/course/list',isAuthenticated,async(req,res) => { 
        // Check Session
        if(req.session.user == null){
            res.redirect('/');
          } 

        let msg = req.query.msg || '';         
        let rows = await dbx.query("select * from course");
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'listcourse',
            title : 'Courses',
            rows : rows, //status : res.length,
            msg: msg,
            session: req.session.user,settings
        });                               
    });

    // Course -- Add or Create
    app.get('/course/add',isAuthenticated,async(req,res) => {       
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'addcourse',
            title : 'Add Course',
            row:{id:0},
            session: req.session.user,settings
        });                  
    });


    // Course -- Edit 
    app.get('/course/edit/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        let rows = await dbx.query("select * from course where id = "+id);
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'addcourse',
            title : 'Edit Course',
            row: rows[0],
            session: req.session.user,settings
        });                       
    });


    // Course -- Delete 
    app.get('/course/del/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        await dbx.query("delete from course where id = "+id);
        res.redirect('/course/list?msg=deleted');                    
    });     
    

    // Course -- Post Form 
    app.post('/course/post',async(req,res) => {
        //res.json(req.body);
        let data = req.body;
        let id = req.body.id;        
        if(id <= 0){
            await dbx.query("insert into course set ?",data)
        }else{
            await dbx.query("update course set ? where id ="+id,data);
            let cs = await dbx.query("select * from course where id = +"+id);
            if(cs[0].code != req.body.code.trim()){ // If Course Code changes -- update course codes in result/link table
               await dbx.query("update link set course_code = '"+req.body.code.trim()+"' where course_code = '"+cs[0].code +"'");
            }         
        } 
        res.redirect('/course/list?msg=saved');            
                                
    });




    
    /* PROGRAM */

    // Program -- Page
    app.get('/program/list',isAuthenticated,async(req,res) => { 
        // Check Session
        if(req.session.user == null){
            res.redirect('/');
          } 

        let msg = req.query.msg || '';         
        let rows = await dbx.query("select p.*,s.title as scheme from program p left join scheme s on s.id = p.scheme");
        console.log(rows);
        let data = await Promise.all(rows.map(async(row,i,array)=>{
            let rowdata = row;
            if(row.link.trim() != ''){               
                    let codes = row.link.split(',');
                    var names = await Promise.all(codes.map(async(code,i,array) => {
                        let ct = await dbx.query("select concat(name,' (',code,') ') as cname from course where code = '"+code+"'");
                        if(ct.length > 0){ return ' '+ct[0].cname+' ';}
                        //return ct.length > 0 ? ' '+ct[0].cname+' ': '';
                    }));
                   // output += names; 
            }
                rowdata.print = names.length > 0 ? names.join(',') : '';                       
                return rowdata;
        }));       

        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'listprog',
            title : 'Programs',
            rows : data,
            msg: msg,
            session: req.session.user,settings
        });                              
    });

    // Program -- Add or Create
    app.get('/program/add',isAuthenticated,async(req,res) => {       
        let schemes = await dbx.query("select * from scheme");
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'addprog',
            title : 'Add Program',
            row:{id:0},schemes,
            session: req.session.user,settings
        });                     
    });


    // Program -- Edit 
    app.get('/program/edit/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        let rows = await dbx.query("select * from program where id = "+id);        
        let schemes = await dbx.query("select * from scheme");
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'addprog',
            title : 'Edit Program',
            row: rows[0],schemes,
            session: req.session.user,settings
        });                        
    });


    // Program -- Delete 
    app.get('/program/del/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        await dbx.query("delete from program where id = "+id);
        res.redirect('/program/list?msg=deleted');                       
    });     
    

    // Program -- Post Form 
    app.post('/program/post',async(req,res)=>{
        let data = req.body;
        let id = req.body.id;        
        if(id <= 0){
            await dbx.query("insert into program set ?",data)
            res.redirect('/program/list?msg=saved');            
        }else{
           let qs = await dbx.query("update program set ? where id ="+id,data);
           console.log(qs.sql);
            res.redirect('/program/list?msg=saved');            
        }                       
    });



    
    /* CALENDAR */

    // Calendar -- Page
    app.get('/calendar/list',isAuthenticated,async(req,res) => { 
        // Check Session
        if(req.session.user == null){
            res.redirect('/');
          } 

        let msg = req.query.msg || '';         
        let rows = await dbx.query("select * from academ");
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'listcal',
            title : 'Calendar',
            rows : rows, //status : res.length,
            msg: msg,
            session: req.session.user,settings
        });                               
    });

    // Calendar -- Add or Create
    app.get('/calendar/add',isAuthenticated,async(req,res) => {       
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'addcal',
            title : 'Add Calendar',
            row:{id:0},
            session: req.session.user,settings
        });                  
    });


    // Calendar -- Edit 
    app.get('/calendar/edit/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        let rows = await dbx.query("select * from academ where id = "+id);        
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'addcal',
            title : 'Edit Calendar',
            row: rows[0],
            session: req.session.user,settings
        });                     
    });


    // Calendar -- Activate 
    app.get('/calendar/activate/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        await dbx.query("update academ set active = '1' where id = "+id);
        await dbx.query("update academ set active = '0' where id <> "+id);
        res.redirect('/calendar/list?msg=activated');                        
    });    


    
    

    // Calendar -- Post Form 
    app.post('/calendar/post',async(req,res)=>{
        let data = req.body;
        let id = req.body.id;        
        if(id <= 0){
            await dbx.query("insert into academ set ?",data)
            res.redirect('/calendar/list?msg=saved');            
        }else{
            await dbx.query("update academ set ? where id ="+id,data);
            res.redirect('/calendar/list?msg=saved');            
        }                             
    });


    // Calendar -- Unregister Student 
    app.get('/calendar/unregisterst/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id.split('_').join('/');
        let academ = await dbx.query("select * from academ where active = '1'");
        await dbx.query("delete from `link` where academ = '"+academ[0].academ+"' and index_number = '"+id+"'");
        res.redirect('/calendar/list?msg=deleted');                     
    });     

    // Calendar -- Register Student 
    app.get('/calendar/registerst/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id.split('_').join('/');
        let ac = await dbx.query("select * from academ where active = '1'");
        let st = await dbx.query("select s.*,g.level,p.*,g.name as gname,g.id as gid from student s left join `groups` g on s.year_group = g.id left join program p on g.program_id = p.id where s.academic_status = 'ACTIVE' and s.index_number = '"+id+"'");
        let lk = await dbx.query("select id,course_code from link where index_number = '"+id+"' and academ = '"+ac[0].academ+"'");
        let lm = st[0].link.split(',');             // Program Courses
        let lx = lk.map(x => x.course_code);      // All Registered Courses
        let dl = lm.filter(x => !lx.includes(x));   // Courses to Register from difference
        let il = lm.filter(x => lx.includes(x));    // Program Courses Registered
        let ml = lx.filter(x => !il.includes(x));   // Courses to Unregister (if any)
        console.log({structure : lm, all_registered : lx, to_register_diff1 : dl, structure_registered : il, to_unregister_diff2 : ml });
        // Courses to Unregister
        if(ml.length > 0){
            for(var c of ml){ 
                await dbx.query("delete from link where index_number = '"+id+"' and academ = '"+ac[0].academ+"' and course_code = '"+c+"'");
            }
        }
        // Courses to Register
        if(dl.length > 0){
            for(var c of dl){ 
                let cs = await dbx.query("select * from course where code = '"+c+"'");                        
                let rows = await dbx.query("select * from link where academ = '"+ac[0].academ+"' and index_number = '"+id+"' and course_code = '"+c+"'");
                let data = {course_code:c, index_number: id, academ : ac[0].academ, group_id : st[0].year_group, scheme: st[0].scheme,semester: ac[0].term, enabled : '1',classx:(settings.appType == 1 ? st[0].prefix+st[0].level : st[0].level+st[0].prefix)};
                (rows.length <= 0 && cs.length > 0) ? await dbx.query("insert into link set ?",data) : '';
            }
        }
        res.redirect('/calendar/list?msg=registered');  
    });     

     // Calendar -- Register Student to Different Program outside group
     app.get('/calendar/registersp/:id/:pid',isAuthenticated,async(req,res) => { 
        let id = req.params.id.split('_').join('/');
        let pid = req.params.pid.trim();
        let ac = await dbx.query("select * from academ where active = '1'");
        let st = await dbx.query("select s.*,g.level,g.name as gname,g.id as gid from student s left join `groups` g on s.year_group = g.id where s.academic_status = 'ACTIVE' and s.index_number = '"+id+"'");
        let lk = await dbx.query("select id,course_code from link where index_number = '"+id+"' and academ = '"+ac[0].academ+"'");
        let ps = await dbx.query("select p.link from link where id = "+pid+"");
        let lm = ps[0].link.split(',');             // Program Courses
        let lx = lk.map(x => x.course_code);      // All Registered Courses
        let dl = lm.filter(x => !lx.includes(x));   // Courses to Register from difference
        let il = lm.filter(x => lx.includes(x));    // Program Courses Registered
        let ml = lx.filter(x => !il.includes(x));   // Courses to Unregister (if any)
        console.log({structure : lm, all_registered : lx, to_register_diff1 : dl, structure_registered : il, to_unregister_diff2 : ml });
        // Courses to Unregister
        if(ml.length > 0){
            for(var c of ml){ 
                await dbx.query("delete from link where index_number = '"+id+"' and academ = '"+ac[0].academ+"' and course_code = '"+c+"'");
            }
        }
        // Courses to Register
        if(dl.length > 0){
            for(var c of dl){ 
                let cs = await dbx.query("select * from course where code = '"+c+"'");                        
                let rows = await dbx.query("select * from link where academ = '"+ac[0].academ+"' and index_number = '"+id+"' and course_code = '"+c+"'");
                let data = {course_code:c, index_number: id, academ : ac[0].academ, group_id : st[0].year_group, scheme: ps[0].scheme,semester: ac[0].term, enabled : '1',classx:(settings.appType == 1 ? ps[0].prefix+st[0].level : st[0].level+ps[0].prefix)};
                (rows.length <= 0 && cs.length > 0) ? await dbx.query("insert into link set ?",data) : '';
            }
        }
        res.redirect('/calendar/list?msg=registered');  
    });     


    
    /* HALL */

    // Hall -- Page
    app.get('/hall/list',isAuthenticated,async(req,res) => {  
        // Check Session
        if(req.session.user == null){
            res.redirect('/');
          } 

        let msg = req.query.msg || '';         
        let rows = await dbx.query("select * from hall");
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'listhall',
            title : 'Halls / Hostels',
            rows : rows, //status : res.length,
            msg: msg,
            session: req.session.user,settings
        });                            
    });

    // Hall -- Add or Create
    app.get('/hall/add',isAuthenticated,async(req,res) => {       
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'addhall',
            title : 'Add Hall',
            row:{id:0},
            session: req.session.user,settings
        });                  
    });


    // Hall -- Edit 
    app.get('/hall/edit/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        let rows = await dbx.query("select * from hall where id = "+id);        
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'addhall',
            title : 'Edit Hall',
            row: rows[0],
            session: req.session.user,settings
        });                   
    });


    // Hall -- Delete 
    app.get('/hall/del/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        await dbx.query("delete from hall where id = "+id);
        res.redirect('/hall/list?msg=deleted');                       
    });     
    

    // Hall -- Post Form 
    app.post('/hall/post',async(req,res)=>{
        let data = req.body;
        let id = req.body.id;        
        if(id <= 0){
            await dbx.query("insert into hall set ?",data)
            res.redirect('/hall/list?msg=saved');            
        }else{
            await dbx.query("update hall set ? where id ="+id,data);
            res.redirect('/hall/list?msg=saved');            
        }                             
    });




  /* FEEDING */

    // Feeding -- Page
    app.get('/feeding/list',isAuthenticated,async(req,res) => { 
        // Check Session
        if(req.session.user == null){
            res.redirect('/');
          } 

        let msg = req.query.msg || '';  
        let academ = await dbx.query("select * from academ where active = '1'");       
        let rows = await dbx.query("select g.name as gname,concat(s.fname,' ',s.lname,'<br/><small><b>-- ',s.index_number,'</b></small>') as student,f.* from feeding f left join student s on s.index_number = f.user left join `groups` g on f.group_id = g.id where academ = '"+academ[0].academ+"'");
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'listfeed',
            title : 'Feeding',
            rows : rows, //status : res.length,
            msg: msg,
            session: req.session.user,settings
        });                                
    });


    // Feeding -- Un-assign Feeding NUmber 
    app.get('/feeding/unassign/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        let fno = await dbx.query("select * from feeding where id = "+id);
         if(fno.length > 0){
             await dbx.query("update feeding set user = NULL, date_added = NULL where id = "+fno[0].id);
         }        
         res.redirect('/feeding/list?msg=unassigned');                         
    });     
    

    // Feeding -- Post Form 
    app.get('/feeding/generate',isAuthenticated,async(req,res)=>{
        let academ = await dbx.query("select * from academ where active = '1'");  

        var rex = await dbx.query("select * from feeding where academ = '"+academ[0].academ+"'");
         if(rex.length == 0){
            var rows = await dbx.query("select * from student where academic_status = 'ACTIVE' order by year_group asc");
            let i = 0;
            rows.map(async(row)=>{
               var lcode = (parseInt(i)+10001).toString().substring(1,5);
              let chck = await dbx.query("select * from feeding where card_no = '"+tcode+"' and academ = '"+academ[0].academ+"'");
                var tcode = 'FDN'+ lcode;
               if(chck.length <= 0){  
                  let data = {academ: academ[0].academ, card_no:tcode, group_id: row.year_group};
                  await dbx.query("insert into feeding set ?",data); 
               } i++;
            });
         } 
         
         res.redirect('/feeding/list?msg=generated');        
    });






    
    
    /* SCHEME */

    // scheme -- Page
    app.get('/scheme/list',isAuthenticated,async(req,res) => { 
        // Check Session
        if(req.session.user == null){
            res.redirect('/');
          } 

        let msg = req.query.msg || '';         
        let rows = await dbx.query("select * from scheme");      
        let data = rows.map((row)=>{
              let rowdata = row;
              let output = 'Scoring { ';
              let score = row.score.split(',');
              let grade = row.grade.split(',');
              let remark = row.remark.split(',');
              for(i = 0; i < score.length; i++){
                  output += score[i]+' - '+grade[i]+' ( '+remark[i]+' )'+( i == (score.length-1) ? '':', ');
              }
              output += ' }';
              rowdata.content = output;
              return rowdata;
        });
        console.log(data);

        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'listscheme',
            title : 'Grading',
            rows : data, //status : res.length,
            msg: msg,
            session: req.session.user,settings
        });                          
    });

    // Scheme -- Add or Create
    app.get('/scheme/add',isAuthenticated,async(req,res) => {       
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'addscheme',
            title : 'Add Grading Scheme',
            row:{id:0},
            session: req.session.user,settings
        });                  
    });


    // Scheme -- Edit 
    app.get('/scheme/edit/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        let rows = await dbx.query("select * from scheme where id = "+id);        
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'addscheme',
            title : 'Edit Grading Scheme',
            row: rows[0],
            session: req.session.user,settings
        });                    
    });


    // Scheme -- Delete 
    app.get('/scheme/del/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        await dbx.query("delete from scheme where id = "+id);
        res.redirect('/scheme/list?msg=deleted');                       
    });     
    

    // Scheme -- Post Form 
    app.post('/scheme/post',async(req,res)=>{
        let data = req.body;
        let id = req.body.id;        
        if(id <= 0){
            data.dateCreated = new Date();
            await dbx.query("insert into scheme set ?",data)
            res.redirect('/scheme/list?msg=saved');            
        }else{
            await dbx.query("update scheme set ? where id ="+id,data);
            res.redirect('/scheme/list?msg=saved');           
        }   
                          
    });



    
    
    /* USERS */

    // User -- Page
    app.get('/user/list',isAuthenticated,async(req,res) => { 
        // Check Session
        if(req.session.user == null){
            res.redirect('/');
          } 

        let msg = req.query.msg || '';         
        let rows = await dbx.query("select * from user order by privilege asc"); 
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'listuser',
            title : 'Users',
            rows : rows, //status : res.length,
            msg: msg,
            session: req.session.user,settings
        });                       
    });


     // User -- Page
     app.get('/user/list/:id',isAuthenticated,async(req,res) => { 
        // Check Session
        if(req.session.user == null){
            res.redirect('/');
          } 
        
        let id = req.params.id;
        let msg = req.query.msg || '';         
        let rows = await dbx.query("select * from user where id = "+id+" order by privilege asc"); 
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'listuser',
            title : 'Users',
            rows : rows, //status : res.length,
            msg: msg,
            session: req.session.user,settings
        });                               
    });


    // User -- Add or Create
    app.get('/user/add',isAuthenticated,async(req,res) => {       
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'adduser',
            title : 'Add User',
            row:{id:0},
            session: req.session.user,settings
        });                  
    });


    // User -- Edit 
    app.get('/user/edit/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        let rows = await dbx.query("select *,DATE_FORMAT(dob,'%Y-%m-%d') as dobx from user where id = "+id);        
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'adduser',
            title : 'Edit User',
            row: rows[0],
            session: req.session.user,settings
        });                           
    });


    // User -- Delete 
    app.get('/user/del/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        await dbx.query("delete from user where id = "+id);
        res.redirect('/user/list?msg=deleted');                      
    });     
    

    // User -- Post Form 
    app.post('/user/post',async(req,res)=>{
        let data = req.body;
        let id = req.body.id;        
        if(id <= 0){
            data.dateCreated = new Date();
            data.dob = new Date(data.dob);
            data.password = md5(settings.pwd+new Date().getFullYear());
            await dbx.query("insert into user set ?",data)                   
        }else{
            await dbx.query("update user set ? where id ="+id,data);                     
        }        
        
        if(req.session.user.privilege == '1'){
            res.redirect('/user/list?msg=saved'); 
        }else{
           res.redirect('/user/list/'+req.session.user.id+'?msg=saved'); 
        }        
    });


    // User -- Reset Password 
    app.get('/user/reset/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        let pwd = settings.pwd+new Date().getFullYear();
        await dbx.query("update user set password = '"+md5(pwd)+"' where id = "+id);
        res.redirect('/user/list?msg=reset');                         
    });   


     // User -- Change Password 
     app.get('/user/setpwd/:id/:pwd',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        let pwd = md5(req.params.pwd.trim());
        let ins = await dbx.query("update user set password = '"+pwd+"' where id = "+id);
       // res.redirect('/user/list?msg=pwdchanged');  
        res.redirect('/logout');            
    });   






    
    /* Assessors */

    // Assessor -- Page
    app.get('/assess/list',isAuthenticated,async(req,res) => {
      
        let msg = req.query.msg || '';         
        //let academ = await dbx.query("select * from academ where active = '1'"); 
         // Update Assessment Status
         let academ = await dbx.query("select * from academ where active = '1'");
         let assess = await dbx.query("select * from link where (exams = -1 or class = -1 or total = -1) and academ = '"+academ[0].academ+"'");
         console.log("ASSESSED:"+assess.length);
         if(assess.length == 0){
             await dbx.query("update academ set assessed = '1' where id = "+academ[0].id);
         }else{
             await dbx.query("update academ set assessed = '0' where id = "+academ[0].id);
         }  

        let rows = await dbx.query("select m.id as mid,m.*,u.* from marker m left join user u on u.id = m.tutor_id where m.academ = '"+academ[0].academ+"'"); 
        let data  = await Promise.all(rows.map(async(row)=>{
           let rowdata = row,assign = row.classArray == null ? '' : row.classArray.trim().split(',');
           let pssign = row.promoArray == null ? '' : row.promoArray.trim().split(',');
           if(assign.length > 0){
                let output = await Promise.all(assign.map(async(ct)=>{
                    let mrow = ct.split(':');
                    let rec = await dbx.query("select l.*,g.name as gname,cr.name as course from link l left join `groups` g on g.id = l.group_id left join course cr on l.course_code = cr.code where l.course_code = '"+mrow[1]+"' and l.group_id = "+mrow[0]+" and l.academ = '"+academ[0].academ+"' limit 1");
                    if(rec.length > 0){
                        return '<a href="/assessment/'+rec[0].group_id+'/'+academ[0].academ+'/'+rec[0].course_code+'" title="Enter Assesments for '+rec[0].gname+' - '+rec[0].course+'" onclick="if(!confirm(\'Enter Results Data for '+rec[0].gname+' - '+rec[0].course+'?\'))return false;" style="border-radius:5px 0 0 5px;color:#666;display:inline-block;margin:5px;background:'+settings.secondColor+';color:#333;padding:10px 15px;font-weight:bolder;"><small>'+rec[0].gname+' - '+rec[0].course+'</small></a><a href="/assess/download/'+rec[0].group_id+'/'+academ[0].academ+'/'+rec[0].course_code+'" title="Download excel template for '+rec[0].gname+' - '+rec[0].course+'" onclick="if(!confirm(\'Download Excel Result Template for '+rec[0].gname+' - '+rec[0].course+'?\'))return false;" style="color:#666;display:inline-block;margin:5px 2px 5px -2px;background:#ddd;color:#333;padding:10px 15px;font-weight:bolder;"><i class="fa fa-download"></i></a><a href="javascript:;"  title="Upload updated excel template for '+rec[0].gname+' - '+rec[0].course+'" onclick="document.getElementById(\'rexcel\').click();" style="color:brown;display:inline-block;margin:5px 2px 5px -2px;background:'+settings.secondColor+';color:#333;padding:10px 15px;font-weight:bolder;"><i class="fa fa-upload"></i></a><form style="display:inline;margin:0" action="/assess/upload" method="post" enctype="multipart/form-data" id="excelform2"><input type="file"  name="rexcel" id="rexcel" style="display:none;"/></form><a href="/assess/'+rec[0].group_id+'/'+academ[0].academ+'/'+rec[0].course_code+'" target="_blank" title="Print Assessment for '+rec[0].gname+' - '+rec[0].course+'" onclick="if(!confirm(\'Print Assessment for '+rec[0].gname+' - '+rec[0].course+'?\'))return false;" style="color:#666;display:inline-block;margin:5px 5px 5px -2px;border-radius:0 5px 5px 0;background:#ccc;color:#333;padding:10px 15px;font-weight:bolder;"><i class="fa fa-print"></i></a>';
                    }
                })); 
                rowdata.output = output.length > 0 ? output.join(' ') : '';
           }

           if(pssign.length > 0){
                let perform = await Promise.all(pssign.map(async(ct,i,array)=>{
                    let rec = await dbx.query("select g.id as gid,g.name as gname from `groups` g where g.id = "+ct);
                    if(rec.length > 0){
                      return '<a href="/remark/'+rec[0].gid+'/'+academ[0].academ+'" onclick="if(!confirm(\'Enter Remarks Data for '+rec[0].gname+'?\'))return false;" style="border-radius:5px;color:#666;display:inline-block;margin:5px;background:'+settings.secondColor+';color:#333;padding:10px 15px;font-weight:bolder;"><small>Class '+rec[0].gname+' - Remarks & Promotion </small></a>'+(academ[0].term == '3' ? '<a href="/remark/stats/'+rec[0].gid+'/'+academ[0].academ+'" target="_blank" title="View Promotion for '+rec[0].gname+'" onclick="if(!confirm(\'View Promotion Statistics for '+rec[0].gname+'?\'))return false;" style="color:#666;display:inline-block;margin:5px 5px 5px -2px;border-radius:0 5px 5px 0;background:#ccc;color:#333;padding:10px 15px;font-weight:bolder;"><i class="fa fa-print"></i></a>':'');
                    }                     
                }));          
                rowdata.perform = perform.length > 0 ? perform.join(' ') : '';;
          } 
               return rowdata;
        }));

        console.log(data);
        res.render('index.ejs',{
            parent: 'eJHS',
            view  : 'listassess',
            title : 'Assessors',
            rows : rows, academ:academ[0],
            msg: msg,
            session: req.session.user,settings
        });                        
    });


  
     // Assessor -- Restrict
     app.get('/assess/list/:id',isAuthenticated,async(req,res) => {
        // Check Session
        if(req.session.user == null){
            res.redirect('/');
          } 
        let id = req.params.id;
        let msg = req.query.msg || '';         
        //let academ = await dbx.query("select * from academ where active = '1'"); 
        // Update Assessment Status
        let academ = await dbx.query("select * from academ where active = '1'");
        let assess = await dbx.query("select * from link where (exams = -1 or class = -1 or total = -1) and academ = '"+academ[0].academ+"'");
        console.log("ASSESSED:"+assess.length);
        if(assess.length == 0){
            await dbx.query("update academ set assessed = '1' where id = "+academ[0].id);
        }else{
            await dbx.query("update academ set assessed = '0' where id = "+academ[0].id);
        }    

        let rows = await dbx.query("select m.id as mid,m.*,u.* from marker m left join user u on u.id = m.tutor_id where m.tutor_id = '"+id+"' and m.academ = '"+academ[0].academ+"'"); 
        let data = await Promise.all(rows.map(async(row) => {
            let rowdata = row,assign = row.classArray == null ? '' : row.classArray.trim().split(',');
            let pssign = row.promoArray == null ? '' : row.promoArray.trim().split(',');
 
            if(assign.length > 0){
 
                 let output = await Promise.all(assign.map(async(ct,i,array)=>{
                     let mrow = ct.split(':');
                     let rec = await dbx.query("select l.*,g.name as gname,cr.name as course from link l left join `groups` g on g.id = l.group_id left join course cr on l.course_code = cr.code where l.course_code = '"+mrow[1]+"' and l.group_id = "+mrow[0]+" and l.academ = '"+academ[0].academ+"' limit 1");
                     console.log(rec);
                     if(rec.length > 0){
                         return '<a href="/assessment/'+rec[0].group_id+'/'+academ[0].academ+'/'+rec[0].course_code+'" title="Enter Assesments for '+rec[0].gname+' - '+rec[0].course+'" onclick="if(!confirm(\'Enter Results Data for '+rec[0].gname+' - '+rec[0].course+'?\'))return false;" style="border-radius:5px 0 0 5px;color:#666;display:inline-block;margin:5px;background:pink;color:#333;padding:10px 15px;font-weight:bolder;"><small>'+rec[0].gname+' - '+rec[0].course+'</small></a><a href="/assess/download/'+rec[0].group_id+'/'+academ[0].academ+'/'+rec[0].course_code+'" title="Download excel template for '+rec[0].gname+' - '+rec[0].course+'" onclick="if(!confirm(\'Download Excel Result Template for '+rec[0].gname+' - '+rec[0].course+'?\'))return false;" style="color:#666;display:inline-block;margin:5px 2px 5px -2px;background:#ddd;color:#333;padding:10px 15px;font-weight:bolder;"><i class="fa fa-download"></i></a><a href="javascript:;"  title="Upload updated excel template for '+rec[0].gname+' - '+rec[0].course+'" onclick="document.getElementById(\'rexcel\').click();" style="color:brown;display:inline-block;margin:5px 2px 5px -2px;background:pink;color:#333;padding:10px 15px;font-weight:bolder;"><i class="fa fa-upload"></i></a><form style="display:inline;margin:0" action="/assess/upload" method="post" enctype="multipart/form-data" id="excelform2"><input type="file"  name="rexcel" id="rexcel" style="display:none;"/></form><a href="/assess/'+rec[0].group_id+'/'+academ[0].academ+'/'+rec[0].course_code+'" title="Print Assessment for '+rec[0].gname+' - '+rec[0].course+'" onclick="if(!confirm(\'Print Assessment for '+rec[0].gname+' - '+rec[0].course+'?\'))return false;" style="color:#666;display:inline-block;margin:5px 5px 5px -2px;border-radius:0 5px 5px 0;background:#ccc;color:#333;padding:10px 15px;font-weight:bolder;"><i class="fa fa-print"></i></a>';
                     }
                 })); 
                 rowdata.output = output.length > 0 ? output.join(' ') : '';
            }
 
            if(pssign.length > 0){
               
                  let perform = await Promise.all(pssign.map(async(ct,i,array)=>{
                       let rec = await dbx.query("select g.id as gid,g.name as gname from groups g where g.id = "+ct);
                       if(rec.length > 0){
                         return '<a href="/remark/'+rec[0].gid+'/'+academ[0].academ+'" onclick="if(!confirm(\'Enter Remarks Data for '+rec[0].gname+'?\'))return false;" style="border-radius:5px 0 0 5px;color:#666;display:inline-block;margin:5px;background:pink;color:#333;padding:10px 15px;font-weight:bolder;"><small>Class '+rec[0].gname+' - Remarks & Promotion </small></a><a href="/remark/stats/'+rec[0].gid+'/'+academ[0].academ+'" title="View Promotion for '+rec[0].gname+'" onclick="if(!confirm(\'View Promotion Statistics for '+rec[0].gname+'?\'))return false;" style="color:#666;display:inline-block;margin:5px 5px 5px -2px;border-radius:0 5px 5px 0;background:#ccc;color:#333;padding:10px 15px;font-weight:bolder;"><i class="fa fa-print"></i></a>';
                       }                     
                  }));          
                 rowdata.perform = perform.length > 0 ? perform.join(' ') : '';;
           } 
                return rowdata;
         }));
         res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'listassess',
            title : 'Assessors',
            rows : rows, academ:academ[0],
            msg: msg,
            session: req.session.user,settings
        });                              
    });



    // User -- Add or Create
    app.get('/assess/add',isAuthenticated,async(req,res) => {  
        let rows = await dbx.query("select * from `user` where privilege = 2");
        let data = await dbx.query("select p.*,g.name as gname,g.id as gid from `groups` g left join program p on p.id = g.program_id where academic_status = 'ACTIVE'");            
        let crs = await dbx.query("select * from course"); 
        let gm = await dbx.query("select * from `groups` where academic_status = 'ACTIVE'");            
        console.log(dbx);
        res.render('index.ejs',{
            parent: 'eJHS',
            view  : 'addassess',
            title : 'Add Assessor',
            rowx:{id:0},tutors:rows,data,crs,gm,
            session: req.session.user,settings
        });                         
    });


    // User -- Edit 
    app.get('/assess/edit/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;       
        let rows = await dbx.query("select * from user where privilege = '2'");
        let data = await dbx.query("select p.*,g.name as gname,g.id as gid from `groups` g left join program p on p.id = g.program_id where academic_status = 'ACTIVE'");            
        let crs = await dbx.query("select * from course"); 
        let gm = await dbx.query("select * from `groups` where academic_status = 'ACTIVE'");            
        let rowx = await dbx.query("select * from marker where id = "+id);
        console.log(rowx);      
        res.render('index.ejs',{
            parent: 'eJHS',
            view  : 'addassess',
            title : 'Edit Assessor',
            rowx: rowx[0],tutors:rows,data,crs,gm,
            session: req.session.user,settings
        });                          
    });


    // User -- Delete 
    app.get('/assess/del/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        await dbx.query("delete from marker where id = "+id);
        res.redirect('/assess/list?msg=deleted');                       
    });     
    

    // User -- Post Form 
    app.post('/assess/post',async(req,res)=>{
        let r = req.body;
        let id = req.body.id, tutor = req.body.tutor_id;           
        let academ = await dbx.query("select * from academ where active = '1'");
        console.log(r);
        delete r.tutor_id;
        delete r.id;
        let link = '',promo = '', m = 1, n = 1;
        
        for(let key in r){                     
            if(key.includes('rm')){                    
                promo += ( n == 1 ? '':',')+r[key];                   
                delete r[key];
                n++;
            }                        
        }
       
        m = 1;
        for(let key in r){            
            link += ( m == 1 ? '':',')+r[key];           
            m++;         
        }

        let data = null;
        if(promo == '' && link != ''){
            data = {classArray:link,promoArray:null,tutor_id:tutor,academ:academ[0].academ};  
        }else if(promo != '' && link == ''){
            data = {classArray:null,promoArray:promo,tutor_id:tutor,academ:academ[0].academ};  
        }else if(promo != '' && link != ''){
            data = {classArray:link,promoArray:promo,tutor_id:tutor,academ:academ[0].academ};  
        }else{
            data = {classArray:null,promoArray:null,tutor_id:tutor,academ:academ[0].academ};  
        }
          
        if(id <= 0){
            data.dateCreated = new Date();
            data.active = '1';
            let insert = await dbx.query("insert into marker set ?",data);
        }else{
            let update = await dbx.query("update marker set ? where id ="+id,data);
        }     
        if(req.session.user.privilege == '1'){
           res.redirect('/assess/list?msg=saved'); 
        }else{
           res.redirect('/assess/list/'+req.session.user.id+'?msg=saved'); 
        }         
    });



    // Upload Excel -- Add Student
    app.post('/assess/excel', async(req, res) => {
        var exceltojson;
        excel(req,res,async(err)=>{          
            if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsx;
            }else {
                exceltojson = xls;
            }
            try{
                exceltojson({
                    input: req.file.path,
                    output: null, // since we don't need output.json
                    lowerCaseHeaders:true
                },async(err,results) => {   
                                                    
                    // Code for Inserting Data                    
                    for(var i = 0; i < results.length; i++){ 
                        console.log(results[i]);                      
                        if(results[i]['indexno'].trim() != ''){
                            let gp = await dbx.query("select g.* from `groups` g where g.name = '"+results[i]['class'].trim()+"' and g.academic_status = 'ACTIVE'");
                            let st = await dbx.query("select * from student where index_number = '"+results[i]['indexno'].trim()+"'");
                                                      
                            if(st.length > 0){                                                                
                                // Index number Algorithm for school
                                let rt = await dbx.query("select * from link where index_number = '"+results[i]['indexno'].trim()+"' and course_code = '"+results[i]['subjectcode'].trim()+"' and academ = '"+results[i]['academ'].trim()+"'");
                                let total = parseInt(results[i]['classscore'].trim())+parseInt(results[i]['examscore'].trim());
                                console.log(rt.length); 
                                if(rt.length == 0){
                                    let data = {index_number:results[i]['indexno'].trim(),class:parseInt(results[i]['classscore'].trim()),exams:parseInt(results[i]['examscore'].trim()),total,scheme:results[i]['scheme'].trim(),course_code:results[i]['subjectcode'].trim(),classx:results[i]['class'].trim(),academ:results[i]['academ'].trim(),group_id:gp[0].id,semester:results[i]['term'].trim(),date_registered: new Date(),enabled:'1'}
                                    dbx.query("insert into link set ?",data);  
                                }                                                   
                            }
                        }
                    }  
                    // Remove File uploaded
                    fs.unlinkSync(req.file.path);
                    // Redirect to student page
                    res.redirect('/assess/list');                   
                });                 

            }catch (e){

                    console.log({error_code:1,err_desc:"Corupted excel file"});                 
                    // Redirect to student page
                    res.redirect('/assess/list?msg=');   
            }            
        });

    }); 



     // Result -- Class Subject Excel EXPORT (SAMPLE)
     app.get('/assess/download/:group/:academ/:course',async(req,res) => {         
        let academ = req.params.academ; 
        let group = req.params.group; 
        let course = req.params.course;       
        let rows = await dbx.query("select l.id as ID,concat(s.fname,' ',s.lname) as STUDENT,l.class CLASS30, l.exams EXAMS70 from link l left join student s on l.index_number = s.index_number where l.academ = '"+academ+"' and l.group_id = '"+group+"' and l.course_code = '"+course+"' order by total desc");
        if(rows.length > 0){
            res.xls(course+'_'+group+'_'+academ+'.xls',rows);
        }else{
            res.redirect('/assess/list');
        }    
               
    });



    // Result -- Class Subject EXCEL IMPORT
    app.post('/assess/upload',async(req,res) => {         
        console.log("EXCEL DATA :") 
        var exceltojson;
        if(req.files && req.files.rexcel){
            const file = './public/'+req.files.rexcel.name;
            await req.files.rexcel.mv(file);
            if(req.files.rexcel.name.split('.')[req.files.rexcel.name.split('.').length-1] === 'xlsx'){
                exceltojson = xlsx;
            }else {
                exceltojson = xls;
            }
            try{
                exceltojson({
                    input: file,
                    output: null, // since we don't need output.json
                    lowerCaseHeaders:true
                },async(err,results) => { 
                    if(err) console.log(err);
                    console.log(results);                             
                    // Code for Inserting Data                    
                    for(var i = 0; i < results.length; i++){                                            
                        if(results[i]['id'].trim() != '' && results[i]['class30'].trim() != '' && results[i]['exams70'].trim() != '' ){
                            let total = parseInt(results[i]['class30'].trim())+parseInt(results[i]['exams70'].trim());
                            let data = {class:results[i]['class30'].trim(),exams:parseInt(results[i]['exams70'].trim()),total}
                            dbx.query("update link set ? where id = "+results[i]['id'].trim(),data);  
                        }
                    }  
                    // Remove File uploaded
                    fs.unlinkSync(file);
                    // Redirect to student page
                    res.redirect('/assess/list');                   
                });            

            }catch (e){
                  // Redirect to student page
                  res.redirect('/assess/list?msg=');   
            }
        }
        /*
        rexcel(req,res,async(err) => {
            console.log(req.file);
            res.json(req.file);
            if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsx;
            }else {
                exceltojson = xls;
            }
            try{
                exceltojson({
                    input: req.file.path,
                    output: null, // since we don't need output.json
                    lowerCaseHeaders:true
                },async(err,results) => { 
                      
                    console.log(results);                             
                    // Code for Inserting Data                    
                    for(var i = 0; i < results.length; i++){                                            
                        if(results[i]['id'].trim() != '' && results[i]['class30'].trim() != '' && results[i]['exams70'].trim() != '' ){
                            let total = parseInt(results[i]['class30'].trim())+parseInt(results[i]['exams70'].trim());
                            let data = {class:results[i]['class30'].trim(),exams:parseInt(results[i]['exams70'].trim()),total}
                            dbx.query("update link set ? where id = "+results[i]['id'].trim(),data);  
                        }
                    }  
                    // Remove File uploaded
                    fs.unlinkSync(req.file.path);
                    // Redirect to student page
                    res.redirect('/assess/list');                   
                });            

            }catch (e){

                    console.log({error_code:1,err_desc:"Corupted excel file"});                 
                    // Redirect to student page
                    res.redirect('/assess/list?msg=');   
            }
        });
        */
    });



    
    /* Transcript */

    // Assessor -- Page
    app.get('/transcript/:id',isAuthenticated,async(req,res) => { 
       
        let msg = req.query.msg || '';  
        let id = req.params.id.split('_').join('/');         
        let academ = await dbx.query("select * from academ where active = '1'"); 
        let rows = await dbx.query("select distinct(l.academ) from link l where l.index_number = '"+id+"' order by l.academ desc"); 
        
        if(rows.length > 0){  
            let data = await Promise.all(rows.map(async(row) => {
                let rec = await dbx.query("select l.*,cr.*,cr.name as course,s.*,cm.*,sc.score,sc.grade,sc.remark as detail from link l left join student s on s.index_number = l.index_number left join course cr on cr.code = l.course_code left join academ cm on cm.academ = l.academ left join scheme sc on l.scheme = sc.id  where l.academ = '"+row.academ+"' and l.index_number = '"+id+"'");
                console.log(rec);                            
                return rec;               
            }));  
           
            res.render('index.ejs',{
                parent: 'KWAHIS',
                view  : 'listscript',
                title : 'Transcript',
                rows : data,
                msg: msg,
                session: req.session.user,settings
            }); 

        }else{
            res.redirect('/student/list?msg=noscript')
        }       
    });

    // User -- Add or Create
    app.get('/result/add/:id/:academ',isAuthenticated,async(req,res) => {  
         let id = req.params.id.split('_').join('/'); 
         let academ = req.params.academ;  
         //let std = await dbx.query("select s.*,cr. from")  
         // Post courses into link table 
         let courses = req.body.progkey.split(',');
         courses.forEach(async(course)=>{
             var rows = await dbx.query("select * from link where academ = '"+academ+"' and index_number = '"+id+"' and course_code = '"+course+"'; select * from course where code = '"+course+"'");
             let data = {course_code:course, index_number: id, academ : academ, group_id : req.body.year_group,semester: req.body.semester, hours: rows[1][0].hours, enabled : '1'};
             console.log(rows[1].length);
             if(rows[0].length <= 0 && rows[1].length > 0){                         
                  await dbx.query("insert into link set ?",data);
                  console.log("INSERT");                                                  
             }else{
                  await dbx.query("update link set ? where academ = '"+req.body.academ+"' and index_number = '"+req.body.index_number+"' and course_code = '"+course+"'",data);
                  console.log("UPDATE");                                                
             }                                 
         });       
        
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'addassess',
            title : 'Add Assessment',
            rowx:{id:0},tutors:rows,data,crs,
            session: req.session.user,settings
        });                    
    });


    // Result -- Edit 
    app.get('/result/edit/:id/:academ',isAuthenticated,async(req,res) => { 
        let id = req.params.id.split('_').join('/'); 
        let academ = req.params.academ;       
        let rows = await dbx.query("select l.id as lid,l.*,s.*,cr.name as course,cr.code,cr.id as cid,cm.*,cm.name as acad from link l left join course cr on l.course_code = cr.code left join student s on l.index_number = s.index_number left join academ cm on cm.academ = l.academ where l.academ = '"+academ+"' and l.index_number = '"+id+"'");
        res.render('index.ejs',{
            parent: 'KWAHIS',
            view  : 'addresx',
            title : 'Edit Assessment',
            rows,stat:1,
            session: req.session.user,settings
        });                       
    });


     // Result -- Print
     app.get('/result/print/:id/:academ',async(req,res) => { 
        let id = req.params.id.split('_').join('/'); 
        let academ = req.params.academ;       
        let rows = await dbx.query("select l.id as lid,l.*,s.*,cr.name as course,cr.code,cr.id as cid,cm.*,cm.name as acad,p.name as prog,g.name as gname,sc.score,sc.grade,sc.remark as detail  from link l left join course cr on l.course_code = cr.code left join student s on l.index_number = s.index_number left join academ cm on cm.academ = l.academ  left join program p on p.id = s.program_id left join `groups` g on l.group_id = g.id left join scheme sc on l.scheme = sc.id where l.academ = '"+academ+"' and l.index_number = '"+id+"'");
        res.render('report/rslip.ejs',{
            parent: 'KWAHIS',           
            title : 'Edit Assessment',
            rows,stat:1,
            session: req.session.user,settings
        });                    
    });


     // Result -- Print
     app.get('/transcript/print/:id',async(req,res) => { 
        let id = req.params.id.split('_').join('/'); 
        let acad = await dbx.query("select distinct(academ) from link where index_number = '"+id+"' order by academ asc");
        let data = await Promise.all(acad.map(async(rec,i,array)=>{
            var rows = await dbx.query("select l.id as lid,l.*,date_format(s.dob,'%M-%d, %Y') as dobx,date_format(s.indate,'%M-%d, %Y') as ind,s.*,cr.name as course,cr.code,cr.id as cid,cm.*,cm.name as acad,p.name as prog,g.name as gname,sc.score,sc.grade,sc.remark as detail  from link l left join course cr on l.course_code = cr.code left join student s on l.index_number = s.index_number left join academ cm on cm.academ = l.academ  left join program p on p.id = s.program_id left join `groups` g on l.group_id = g.id left join scheme sc on l.scheme = sc.id where l.academ = '"+rec.academ+"' and l.index_number = '"+id+"'");
             return rows;
        }));
        res.render('report/trslip.ejs',{
            parent: 'KWAHIS',           
            title : 'Edit Assessment',
            data,stat:1,
            session: req.session.user,settings
        });            
    });


    // Result -- Print
    app.get('/group/result/:id',async(req,res) => { 
        let id = req.params.id.split('_').join('/'); 
        let academ = await dbx.query("select * from academ where active = '1'"); 
        let filter = await dbx.query("select distinct(l.index_number) from link l where l.academ = '"+academ[0].academ+"' and group_id = '"+id+"'");
        console.log(filter);
        let rows = await Promise.all(filter.map(async(filt,i,array) => {
            console.log(filt);
            let row = await dbx.query("select l.id as lid,l.*,s.*,cr.name as course,cr.code,cr.id as cid,cm.*,cm.name as acad,p.name as prog,g.name as gname,sc.score,sc.grade,sc.remark as detail  from link l left join course cr on l.course_code = cr.code left join student s on l.index_number = s.index_number left join academ cm on cm.academ = l.academ  left join program p on p.id = s.program_id left join `groups` g on l.group_id = g.id left join scheme sc on l.scheme = sc.id where l.academ = '"+academ[0].academ+"' and l.index_number = '"+filt.index_number+"'");
            return row;
        }));       
        res.render('report/rs.ejs',{
            parent: 'eJHS',           
            title : 'Print Result',
            data:rows,stat:1,
            session: req.session.user,settings
        });                   
    });


     // Result -- Class Subject Print
     app.get('/assess/:group/:academ/:course',async(req,res) => {         
        let academ = req.params.academ; 
        let group = req.params.group; 
        let course = req.params.course;       
        let rows = await dbx.query("select l.id as lid,l.*,s.*,cr.name as course,cr.code,cr.id as cid,cm.*,cm.name as acad,p.name as prog,g.name as gname,sc.score,sc.grade,sc.remark as detail  from link l left join course cr on l.course_code = cr.code left join student s on l.index_number = s.index_number left join academ cm on cm.academ = l.academ  left join program p on p.id = s.program_id left join `groups` g on l.group_id = g.id left join scheme sc on l.scheme = sc.id where l.academ = '"+academ+"' and l.group_id = '"+group+"' and l.course_code = '"+course+"' order by total desc");
        res.render('report/cslip.ejs',{
            parent: 'KWAHIS',           
            title : 'Assessment',
            rows,stat:1,
            session: req.session.user,settings
        }); 
                   
    });   


    // Invoice  System
    app.get('/invoice',(req,res) => {
          res.render('report/invoice2',{settings});
    });


    
    // User -- Post Form 
    app.post('/result/postx',async(req,res)=>{
        let r = req.body;
        let id = req.body.id;    
        console.log(req.body);  			  
        if(id > 0){
            
            for(let i = 1;i <= req.body.total; i++){
                // Set New Data for every student
                let mdata = {};                
                mdata['exams'] =  req.body['e'+i];
                mdata['class'] = req.body['c'+i];
                mdata['total'] = Number(req.body['e'+i]) + Number(req.body['c'+i])	
                mdata['academ'] = req.body.academ;												
                mdata['id'] =  req.body['t'+i];
                console.log(mdata);
                // Update record of each student
                await dbx.query("update link set ? where id ="+mdata['id'],mdata);
            } 
            res.redirect('/transcript/'+(req.body.index_number.split('/').join('_'))); 
                
                   
        }else{
            let mdata = {};
            console.log(mdata); 
            let update = await dbx.query("update marker set ? where id ="+id,mdata);
            console.log("update");
            res.redirect('/transcript/'+(req.body.index_number.split('/').join('_'))); 
        }
    });



    
    // Assessment -- Page 
    app.get('/assessment/:group/:academ/:code',isAuthenticated,async(req,res) => {         
      
        let academ = req.params.academ; 
        let group = req.params.group; 
        let code = req.params.code;   

        let rows = await dbx.query("select l.id as lid,l.*,s.*,cr.name as course,cr.code,cr.id as cid,cm.*,cm.name as acad,g.name as gname from link l left join course cr on l.course_code = cr.code left join student s on l.index_number = s.index_number left join academ cm on cm.academ = l.academ left join `groups` g on l.group_id = g.id where l.academ = '"+academ+"' and l.group_id = '"+group+"' and l.course_code = '"+code+"'");
        res.render('index.ejs',{
            parent: 'eJHS',
            view  : 'addresc',
            title : 'Assessment',
            rows,stat:1,
            session: req.session.user,settings
        });                  
    });

    
    // Assessment -- Post Form 
    app.post('/assessment/postc',async(req,res)=>{
        let r = req.body;
        let id = req.body.id;    
        console.log(req.body);  			  
        if(id > 0){
            
            for(let i = 1;i <= req.body.total; i++){
                // Set New Data for every student
                let mdata = {};
                
                mdata['exams'] =  req.body['e'+i];
                mdata['class'] = req.body['c'+i];
                mdata['total'] = Number(req.body['e'+i]) + Number(req.body['c'+i])	
                mdata['academ'] = req.body.academ;												
                mdata['id'] =  req.body['t'+i];
                console.log(mdata);
                // Update record of each student
                await dbx.query("update link set ? where id ="+mdata['id'],mdata);
            } 
            res.redirect('/assess/list'); 
                
                   
        }else{
            let mdata = {};
            console.log(mdata); 
            let update = await dbx.query("update marker set ? where id ="+id,mdata);
            console.log("update");
            res.redirect('/assess/list'); 
        }
    });



    // FIX CODE
    app.get('/fix1',async(req,res) => { 
        // Set Link Group ID to Various Groups ID
        let des = await dbx.query("select * from student where academic_status = 'ACTIVE'");
        des.forEach(async(row)=>{
             let m = await dbx.query("update link set group_id = '"+row.year_group+"' where index_number = '"+row.index_number+"'")
        });
        res.redirect('/assess/list');
    });        
     

    app.get('/fix2',async(req,res) => { 
        // Set Link Group ID to Various Groups ID
         await dbx.query("update link set class = '-1',exams = '-1',total = '-1',scheme = '1'")
         res.redirect('/assess/list'); 
    }); 

    
    app.get('/stageres',isAuthenticated,async(req,res) => { 
        let academ = await dbx.query("select * from academ where active = '1'");
        let studs = await dbx.query("select s.*,g.level,p.*,g.name as gname,g.id as gid from student s left join `groups` g on s.year_group = g.id left join program p on g.program_id = p.id"); 
        studs.forEach(async(stud) =>{                                           
               // Stage Performance
               let rowx = await dbx.query("SELECT * from `perform` where academ = '"+academ[0].academ+"' and index_number = '"+stud.index_number+"'");
               let datax = {index_number:stud.index_number,academ:academ[0].academ,term:academ[0].term,cur_classx:(settings.appType == 1 ? stud.prefix+stud.level : stud.level+stud.prefix),group_id:stud.gid};
               if(rowx.length == 0){                         
                  await dbx.query("insert into `perform` set ?",datax);
               }

               // Stage Subjects                                          
               let courses = (stud.link.trim()).split(',');          
               for(var course of courses){                     
                   let cs = await dbx.query("select * from course where code = '"+course+"'");                        
                   let rows = await dbx.query("select * from link where academ = '"+academ[0].academ+"' and index_number = '"+stud.index_number+"' and course_code = '"+course+"'");
                   let data = {course_code:course, index_number: stud.index_number, academ : academ[0].academ, group_id : stud.year_group, scheme: stud.scheme,semester: academ[0].term, enabled : '1',classx:(settings.appType == 1 ? stud.prefix+stud.level : stud.level+stud.prefix)};
                   if(rows.length <= 0 && cs.length > 0){                         
                       await dbx.query("insert into link set ?",data);
                       console.log("INSERT LINK");                                                  
                   }else{
                       await dbx.query("update link set ? where academ = '"+academ[0].academ+"' and index_number = '"+stud.index_number+"' and course_code = '"+course+"'",data);
                       console.log("UPDATE LINK");                                                
                   }                  
               } 
       });
       // Update Academic Term of Registration Success!
       await dbx.query("update `academ` set registered = '1' where id = "+academ[0].id);
       res.redirect('/calendar/list?msg=registered');  
    });     
     


    app.get('/promote/class',async(req,res) => { 
        let academ = await dbx.query("select * from academ where active = '1'");
        let groups = await dbx.query("select g.name,g.id,g.level,p.levels,p.prefix,p.order from `groups` g left join program p on g.program_id = p.id"); 
        let perf = await dbx.query("select * from perform where status = '0' and academ = '"+academ[0].academ+"'");
        
        if(academ[0].term == 3 && perf.length == 0){
                groups.map(async(group) =>{ 
                        let nlevel = group.level+1;
                        let num = group.levels.trim().split(',').find((n) => {
                                return nlevel == Number(n);
                        });
                        console.log("CURRENT :"+group.level+" , NEW :"+num);
                        if(num == null){
                            // Get next program in Order and Update group program_id, name and level
                            let nOrder = group.order+1;                   
                            let nprog = await dbx.query("select * from program where `order` = "+nOrder);
                            if(nprog.length > 0){
                               let numx = nprog[0].levels.split(',')[0];
                               console.log("LEVEL: "+numx);
                               let data = {name: (settings.appType == 1 ? group.prefix+numx : numx+group.prefix), program_id:nprog[0].id, level:numx};
                               await dbx.query("update `groups` set ? where id = "+group.id,data);
                               console.log("CURRENT :"+group.name+" , NEW :"+(settings.appType == 1 ? group.prefix+numx : numx+group.prefix));
                            }else{
                                let data = {name: (settings.appType == 1 ? group.prefix+new Date().getFullYear() : new Date().getFullYear()+group.prefix), program_id:nprog[0].id, level:new Date().getFullYear(), academic_status:'GRADUATED'};
                                await dbx.query("update `groups` set ? where id = "+group.id,data);                                
                            }
                        }else{
                            // Increase Level of group from Levels Range
                            let nOrder = group.order+1;
                            console.log("New Order : "+nOrder);
                            let data = {name:(settings.appType == 1 ? group.prefix+nlevel : nlevel+group.prefix), level:nlevel};
                            await dbx.query("update `groups` set ? where id = "+group.id,data); 
                            console.log("CURRENT :"+group.name+" , NEW :"+(settings.appType == 1 ? group.prefix+nlevel : nlevel+group.prefix));                                 
                        }  
                        
                        // Update Individual Promotional Status
                           let studs = await dbx.query("select p.*,g.name from perform p left join `groups` g on p.group_id = g.id where p.group_id ="+group.id);
                           studs.forEach(async stud => {
                              let new_classx = stud.name, cur_classx = group.name, status = stud.status;
                              if(status == '1'){
                                  // Promoted --  update class name not group id
                                  await dbx.query("update `perform` set new_classx = '"+new_classx+"' where id = "+stud.id); 
                            
                              }else if(status == '-1'){
                                  // Repeated -- update new class of student or new group id
                                  await dbx.query("update `perform` set new_classx = '"+cur_classx+"' where id = "+stud.id);  
                                  let gs = await dbx.query("select * from `groups` where name = '"+cur_classx+"'");
                                  if(gs.length>0){
                                    await dbx.query("update `student` set year_group = '"+gs[0].id+"' where index_number = '"+stud.index_number+"'");               
                                  }            
                              }
                           });
                });  

                 // Update Academic Term cdof Promotion Success!
                 await dbx.query("update `academ` set promoted = '1' where id = "+academ[0].id);               
                 res.redirect('/calendar/list?msg=promoted');   
        }else{
                res.redirect('/calendar/list?msg=failed'); 
        } 
    });    
    
    
    // Assessment -- Page 
    app.get('/remark/:group/:academ',isAuthenticated,async(req,res) => {         
       
         let academ = req.params.academ; 
         let group = req.params.group; 
         
         let rows = await dbx.query("select p.id as pid,p.*,s.*,cm.*,cm.name as acad,g.name as gname from perform p left join `groups` g on g.name = p.cur_classx left join student s on p.index_number = s.index_number left join academ cm on cm.academ = p.academ  where p.academ = '"+academ+"' and g.id = '"+group+"'");
         console.log(rows);
         res.render('index.ejs',{
             parent: 'eJHS',
             view  : 'addpromo',
             title : 'CLASS REMARKS',
             rows,stat:1,
             session: req.session.user,settings
         });         
     });
 
    
     
    // Reamrks & Promotion Stats -- Page 
    app.get('/remark/stats/:group/:academ',isAuthenticated,async(req,res) => {         
        
         let academ = req.params.academ;        
         let id = req.params.group.split('_').join('/'); 
         let filter = await dbx.query("select distinct(l.index_number) from link l where l.academ = '"+academ+"' and group_id = '"+id+"'");
         //let filter = await dbx.query("select p.id as pid,p.*,s.*,cm.*,cm.name as acad,g.name as gname from perform p left join `groups` g on g.name = p.cur_classx left join student s on p.index_number = s.index_number left join academ cm on cm.academ = p.academ  where p.academ = '"+academ+"' and g.id = '"+id+"'");
         let rows = await Promise.all(filter.map(async(filt,i,array) => {
             console.log(filt);
             let row = await dbx.query("select l.id as lid,l.*,s.*,pf.status,cr.name as course,cr.code,cr.id as cid,cm.*,cm.name as acad,p.name as prog,g.name as gname,sc.score,sc.grade,sc.remark as detail,sc.cutoff  from link l left join course cr on l.course_code = cr.code left join student s on l.index_number = s.index_number left join academ cm on cm.academ = l.academ  left join program p on p.id = s.program_id left join `groups` g on l.group_id = g.id left join scheme sc on l.scheme = sc.id left Join perform pf on pf.index_number = l.index_number where l.academ = '"+academ+"' and pf.academ = cm.academ and l.index_number = '"+filt.index_number+"'");
             return row;
         })); 
         
         res.render('report/prom',{            
            title : 'CLASS PROMOTION STATICSTICS',
            rows,stat:1,
            session: req.session.user,settings
         });
    });
 
    



     // Remarks and Promotion -- Post Form 
     app.post('/promote/remark',async(req,res)=>{        
            let id = req.body.id;               
            for(let i = 1;i <= req.body.total; i++){
                // Set New Data for every student
                let mdata = {};                 
                mdata['remark'] =  req.body['r'+i];
                mdata['status'] = req.body['s'+i];                	
                mdata['academ'] = req.body.academ;												
                mdata['id'] =  req.body['t'+i];
                console.log(mdata);
                // Update record of each student
                await dbx.query("update perform set ? where id ="+mdata['id'],mdata);
            } 
            res.redirect('/assess/list');     
     });


    app.get('/promote/student/:id',isAuthenticated,async(req,res) => { 
        let academ = await dbx.query("select * from academ where active = '1'");
        let studs = await dbx.query("select s.*,g.level,p.*,g.name as gname from  student s left join `groups` g on s.year_group = g.id left join program p on g.program_id = p.id"); 
        studs.map(async(stud) =>{ 
                 // Stage Performance
                 let rowx = await dbx.query("SELECT * FROM `perform`");
                 console.log(rowx.length);
                 console.log(stud);
                 let datax = {index_number:stud.index_number,academ:academ[0].academ,term:academ[0].term,cur_classx:(settings.appType == 1 ? stud.prefix+stud.level : stud.level+stud.prefix)};
                 if(rowx.length == 0){                         
                     await dbx.query("insert into `perform` set ?",datax);
                     console.log("INSERT PERFORMANCE");                                                  
                 }
        });
        // Update Academic Term of Registration Success!
       // await dbx.query("update `academ` set registered = '1' where id = "+academ[0].id);
        res.redirect('/calendar/list?msg=registered');
    });     







    /* STUDENT DASHBOARD */
    // Dashboard
    app.get('/st_dash',isAuthenticated,async(req,res) => {  
        
         let id = req.session.user.index_number; 
         let academ = await dbx.query("select * from academ where active = '1'")
         let fees = await dbx.query("select t.id as tid,r.username,DATE_FORMAT(t.date,'%Y-%m-%d') as pdate,concat(s.fname,' ',s.lname,'<br/><small><b>-- ',s.index_number,'</b></small>') as student,s.*,t.*,b.* from transact t left join student s on t.index_number = s.index_number left join user r on r.id = t.receiver left join bill b on t.bill = b.id where t.action = 'D' and t.bill >= 0  and t.index_number = '"+id+"' order by t.index_number,t.id desc");
         let ress = await dbx.query("select distinct(l.academ) from link l left join academ cm on cm.academ = l.academ  where l.index_number = '"+id+"' and cm.assessed = '1' order by l.academ desc limit 1"); 
          console.log(ress);
         var results;
         if(ress.length > 0){  
            results = await Promise.all(ress.map(async(row) => {
                let rec = await dbx.query("select l.*,cr.*,cr.name as course,s.*,cm.*,sc.score,sc.grade,sc.remark as detail from link l left join student s on s.index_number = l.index_number left join course cr on cr.code = l.course_code left join academ cm on cm.academ = l.academ left join scheme sc on l.scheme = sc.id  where l.academ = '"+row.academ+"' and l.index_number = '"+id+"'");
                console.log(rec);                            
                return rec;               
            }));
         }else{  
            results = null;
         }
 
        // Balance or Debt Calculation.
        let rex = await dbx.query("select t.*,b.min_pay from transact t left join bill b on t.bill = b.id where t.action = 'C' and t.index_number = '"+id+"' order by id desc limit 1; select sum(amount) as debt from transact where action = 'C' and index_number = '"+id+"'; select sum(amount) as paid from transact where action = 'D' and index_number = '"+id+"'; select *,DATE_FORMAT(date,'%Y-%m-%d') as paydate from transact where action = 'D' and bill >= 0 and index_number = '"+id+"' order by id desc; select sum(amount) as bal from transact where action = 'D' and bill < 0 and index_number = '"+id+"'; select sum(amount) as arrears from transact where action = 'C' and bill < 0 and index_number = '"+id+"';");                                                           
        const cur_bill =  rex[0].length > 0 ? rex[0][0].amount : 0;
        const debt = (rex[1][0].debt - cur_bill) || 0;
        const paid =  rex[2][0].paid || 0;
        const charge = cur_bill + debt;
        const tbal =  charge - paid;
            
        res.render('instex.ejs',{
            parent: 'KWAHIS',
            view  : 'dashboard',
            title : 'Student Dashboard',
            active: 'st_dash',
            fees,results,academ,tbal,         
            session: req.session.user,settings
        });                
    });
     

    // Fees
    app.get('/st_fee',isAuthenticated,async(req,res) => {
        let id = req.session.user.index_number; 
        //let id = '20180015';         
        let rows = await dbx.query("select t.id as tid,r.username,DATE_FORMAT(t.date,'%Y-%m-%d') as pdate,concat(s.fname,' ',s.lname,'<br/><small><b>-- ',s.index_number,'</b></small>') as student,s.*,t.*,b.* from transact t left join student s on t.index_number = s.index_number left join user r on r.id = t.receiver left join bill b on t.bill = b.id where t.action = 'D' and t.bill >= 0  and t.index_number = '"+id+"' order by t.index_number,t.id desc");
        res.render('instex.ejs',{
            parent: 'KWAHIS',
            view  : 'fee',
            title : 'Student Fees',
            active: 'st_fee',
            rows,          
            session: req.session.user,settings
        });              
    });


    // Results
    app.get('/st_result',isAuthenticated,async(req,res) => {  
        let id = req.session.user.index_number; 
        //let id = '20180015';         
        let rows = await dbx.query("select distinct(l.academ) from link l where l.index_number = '"+id+"' order by l.academ desc"); 
        
        if(rows.length > 0){  
            let data = await Promise.all(rows.map(async(row) => {
                let rec = await dbx.query("select l.*,cr.*,cr.name as course,s.*,cm.*,sc.score,sc.grade,sc.remark as detail from link l left join student s on s.index_number = l.index_number left join course cr on cr.code = l.course_code left join academ cm on cm.academ = l.academ left join scheme sc on l.scheme = sc.id  where l.academ = '"+row.academ+"' and l.index_number = '"+id+"'");
                console.log(rec);                            
                return rec;               
            }));                 
        
            res.render('instex.ejs',{
                parent: 'KWAHIS',
                view  : 'result',
                title : 'Student Results',
                active: 'st_result', 
                rows:data,         
                session: req.session.user,settings
            });  
        }       
    });
     


    // Bills
    app.get('/st_bill',isAuthenticated,async(req,res) => {       
        
        let id = req.session.user.index_number; 
        //let id = '20180015';         
        let rows = await dbx.query("select DATE_FORMAT(b.date,'%d/%m/%Y') as sdate, a.name as academs,a.term,b.bill as bname,b.id as bid,b.*,t.* from transact t left join bill b on t.bill = b.id left join academ a on a.academ = b.academ where t.action = 'C' and t.index_number = '"+id+"'");                                                          
        res.render('instex.ejs',{
            parent: 'eJHS',
            view  : 'bill',
            title : 'Student Bills',
            rows,
            active: 'st_bill',          
            session: req.session.user,settings
        });                      
    });


    
    // User -- Reset Password 
    app.get('/st_reset/:id',isAuthenticated,async(req,res) => { 
        let id = req.params.id.trim();
        let pwd = settings.pwd+new Date().getFullYear();
        await dbx.query("update student set password = '"+md5(pwd)+"' where index_number = "+id);
        res.redirect('/student/list?msg=pwd');
    });   


     // User -- Change Password 
     app.get('/st_setpwd/:id/:pwd',isAuthenticated,async(req,res) => { 
        let id = req.params.id;
        let pwd = md5(req.params.pwd.trim());
        let ins = await dbx.query("update student set password = '"+pwd+"' where id = "+id);
       // res.redirect('/user/list?msg=pwdchanged');  
        res.redirect('/logout');  
    });  

    

    // 404 - REDIRECTION
    app.get('*', function(req, res){
       res.redirect('/login');
    });



     
    























































//dbx.release();
//conn.release();
;

}