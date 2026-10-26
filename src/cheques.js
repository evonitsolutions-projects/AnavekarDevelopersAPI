const { error } = require("console");
const multer = require("multer");
const path = require("path");

module.exports = function (app, connection) {
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/cheques/'); // Directory to save the files
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname)); // Generate a unique name for the file
    }
  });
  
  const upload = multer({ storage: storage });

  app.post("/addcheques", upload.single("file"), (req, res) => {
    const { date, branch, description,amount,paymentType} = req.body;
    const cheque = req.file;
    const currrentDate = new Date();
    const amt=parseFloat(amount);
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    connection.query(
      "INSERT INTO `cheques`(`date`, `branch`, `description`, `filePath`, `createdDate`, `updateDate`,`amount`,`paymentType`) VALUES(?, ?, ?, ?,?,?,?,?)",
      [
        date,
        branch,
        description,
        cheque ? path.join("public/cheques", cheque.filename) : "",
        formatDate(currrentDate),
        formatDate(currrentDate),
        amt,
        paymentType
      ],
      (err, result) => {
        if (err) {
          // return res.status(500).json({ error: "Internal server error" });
          return res.json({
            data: "Error",
            code: 500,
          });
        } else {
          // return res.status(200).json({ meassage: "Success" });
          return res.json({
            data: "success",
            code: 200,
          });
        }
      }
    );
  });

  app.post("/chequesupdate", upload.single("file"), (req, res) => {
    const { date, branch, description,aid,amount,paymentType } = req.body;
    const cheque = req.file;
    const currrentDate = new Date();
    const amt=parseFloat(amount);
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    let query="UPDATE `cheques` SET `date`=?,`branch`=?,`description`=?,`updateDate`=?,`amount`=?,`paymentType`=?";
    let queryParams= [
      date,
      branch,
      description,
      formatDate(currrentDate),
      amt,
      paymentType,
    ];
    if (cheque) {
      query += ", `filePath`=?";
      queryParams.push(path.join("public/cheques", cheque.filename));
    }
    query += " WHERE `id`=?";
    queryParams.push(aid);
    connection.query(query, queryParams, (err, result) => {
      if (err) {
        console.error("Error executing UPDATE query: ", err);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Customer not found" });
        }
        console.log("Customer updated successfully:", result);
        return res.json({
          data: result,
          code: 200,
        });
      }
    });
  });
  
  app.post("/cheques", (req, res) => {
    const bid = parseInt(req.body.bid);
    let query = "";
    if (bid === 0 || !bid)
    {
      query = "SELECT c.*, b.brandName FROM cheques c INNER JOIN branch b ON c.branch = b.id ORDER BY c.date ASC";
    }else
    {
      query = "SELECT c.*, b.brandName FROM cheques c INNER JOIN branch b ON c.branch = b.id WHERE c.branch=? ORDER BY c.date ASC";
    }
    connection.query(query,[bid],(err, rows) => {
      if (err) {
       
        return res.status(500).json({ error: "Internal server error",code:500});
      } else {
        // console.log(rows);
        if (rows.length > 0) {
          return res.json({
            data: rows,
            code: 200,
          });
        } else {
          return res.json({
            data: "Not Have",
            code: 500,
          });
        }
      }
    });
  });

  app.post("/deleteDetails", (req, res) => {
    const id = parseInt(req.body.id);
    connection.query("DELETE FROM `cheques` WHERE `id`=?",[id],(err,rows)=>{
        if(err)
        {
            console.log(err);
            return res.status(500).json({ error: "Internal server error" });
        } else {
            console.log(rows);
            return res.json({
                data: rows,
                code: 200,
            });
        }
    });
});
app.post("/changepass",upload.none(),(req, res) => {
  const {uid,type,oldpass,newpass,cmpPass }=req.body;
  connection.query("SELECT * FROM `login` WHERE `empid`=? AND `type`=? AND `pass`=?",[uid,type,oldpass],(err,rows)=>{
    if(err)
      {
        console.log(err)
        return res.status(500).json({ error: "Inernal server error" });
      }else
      {
        if(rows.length > 0)
        {
            connection.query("UPDATE `login` SET `pass`=? WHERE `empid`=?",[cmpPass,uid],(err,row)=>{
              if(err)
              {
                return res.status(500).json({error: "Internal Server Error"});
              }
              else
              {
                return res.json({
                  data: rows,
                  code: 200,
                });
              } 
            });
        }else
        {
          return res.json({
            data: "",
            code: 201,
          });
        }
        
      }
  });
});

};
