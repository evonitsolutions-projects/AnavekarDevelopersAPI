const path=require('path');
const multer = require('multer');
const fs=require('fs');
const pdf=require('pdf-parse');
const nodemailer=require('nodemailer');
module.exports = function (app, connection) 
{
    const upload = multer();
    // app.post("/addStatementForm",upload.none(), (req, res) => 
    // {
    //     console.log(req.body);
    // });
}   