const path = require("path");
const multer = require("multer");
module.exports = function (app, connection) 
{
    const upload = multer();
    // This is to handle form data parsing
    app.use(upload.any());
    
    // app.post("/addbank",upload.none(),(req, res) => 
    // {
    //     const date = new Date();
    //     console.log('done');
    // });
}