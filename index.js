var express = require('express');
var session = require('express-session');
var fileupload = require('express-fileupload');
var bodyParser = require('body-parser');
var util = require('util');
var md5 = require('md5');
var xls = require("xls-to-json-lc");
var xlsx = require("xlsx-to-json-lc");
var json2xls = require("json2xls");
var fs = require('fs');

// Webcam Script
var NodeWebcam = require( "node-webcam" );
var opts = { 
    width: 500, 
    height: 500, 
    quality: 80, 
    delay: 0,  
    saveShots: true,  
    output: "jpeg", 
    device: false,  
    callbackReturn: "location", 
    verbose: true 
};
var Webcam = NodeWebcam.create( opts );
// Importing DB Connection
var con = require('./config/connection');
// Promisify Connection 
var dbx = require('./config/database');
// Import modules Initialiser
var init = require('./models/init');
// Initialise Applications
var app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use("/public",express.static("public"));
app.use("/admin",express.static("views/admin"));
app.use("/client",express.static("views/student"));
app.use("/routes",express.static("routes"));
app.use(json2xls.middleware);
app.use(fileupload());
app.set("view engine","ejs");
app.use(session({
    secret: 'kwahisapp', 
    resave: true,
    saveUninitialized: true})
);


// Importing Routes
var route = require('./routes/route');
var port = 5002;

// Initialise API Routes
route(app,con,init,dbx,md5,Webcam,xls,xlsx,json2xls,fs);   
// Starting  Web Server
app.listen(port, () => {
    console.log("Server started on Port : "+port);
});