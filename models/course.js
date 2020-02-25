module.exports = (db,code)=>{   
    db.query("select * from course where code = '"+code+"'",(err,cs) =>{
        if(err) return null;
        return cs;
    });                                        
} 