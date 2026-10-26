
const multer=require('multer');
const path=require('path');
module.exports = function (app, connection) 
{
   
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, './public/vendor');
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.originalname);
        }
      });
    const uploadFiles = multer({ storage: storage }).fields([
        { name: 'doc', maxCount: 1 }
      ]);

      app.post('/vendor', uploadFiles, (req, res) => {
        // console.log('Received form data:', req.body);
        // console.log('Received files:', req.files);

        const { doc } = req.files;
        const {
            fname,
            lname,
            branch,
            address,
            mobile,
            pincode,
            city,
            email,
            cmpname,
            cmpgst,
            uid,
            addtype
        } = req.body;
        const fullname=fname+" "+lname;
        const date = new Date();

        connection.query("SELECT * FROM vendor WHERE mobile = ?", [mobile], (err, rows) => {
            if (err) 
            {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            }else
            {
                if (rows.length > 0) 
                  {
                      // return res.status(200).json({ error: "Mobile number already exists" });
                      return res.json({
                          // data: result,
                          code: 201,
                      });
                  }else
                  {
                      connection.query("INSERT INTO `vendor`(`bid`, `fname`, `lname`, `full`, `email`, `address`, `mobile`, `pincode`, `city`, `cmpname`, `cmpgst`, `doc`, `regdate`,`uid`,`addtype`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[
                          branch,
                          fname,
                          lname,
                          fullname,
                          email,
                          address,
                          mobile,
                          pincode,
                          city,
                          cmpname,
                          cmpgst,
                          doc ? path.join('public/vendor', doc[0].filename) : '',
                          date,
                          uid,
                          addtype
                      ],(err,result)=>{
                          if(err)
                          {
                              console.error("Error executing INSERT query: ", err);
                              return res.status(500).json({ error: "Internal server error" });
                          }else
                          {
                              console.log("Vendor added successfully:", result);
                              return res.json({
                                  data: result,
                                  code: 200,
                              });
                          }
                      })
                  }
              }
          });
      });

      app.post("/venList", (req, res) => {
        const bid = parseInt(req.body.bid);
        let query = '';
        if (bid === 0 || !bid) {
            query = "SELECT * FROM vendor";
        } else {
            query = "SELECT * FROM vendor WHERE bid = ?";
        }
        connection.query(query,[bid],(err, rows) => {
            if (err) 
            {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                if (rows.length > 0)
                {
                    return res.json({
                        data: rows,
                        code: 200,
                    });
                }else
                {
                    // return res.status(200).json({ error: "Branch Are Empty" });
                    return res.json({
                        data: rows,
                        code: 201,
                    });
                }
            }
        });
    });

    app.post("/venListIndividual", (req, res) => {
      console.log(req.body.vid);
      const vid=req.body.vid;
        // connection.query("SELECT * FROM customer WHERE cid=?",[cid],(err, rows) => {
        connection.query("SELECT vendor.*, branch.brandName FROM vendor INNER JOIN branch ON vendor.bid = branch.id WHERE vendor.vid = ?", [vid], (err, rows) => {
            if (err) 
            {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                if (rows.length > 0)
                {
                    return res.json({
                        data: rows,
                        code: 200,
                    });
                }else
                {
                    return res.status(200).json({ error: "vendor Not" });
                }
            }
        });
    });

    app.post("/deleteVendor", (req, res) => {
        const vid = parseInt(req.body.vid);
        let query = "";
    
        // connection.query("SELECT `cid` FROM `plotsale` WHERE `cid` = ?", [cid], (err, rows) => {
        //   if (err) {
        //     console.error(err);
        //     return res.status(500).json({ error: "Internal server error" });
        //   } else {
        //     if (rows.length > 0) 
        //     {
        //         return res.json({
        //           data: rows,
        //           code: 201,
        //         });
        //     } else 
        //     {
              connection.query("Delete FROM `vendor` WHERE `vid`=?",[vid],(err,rows1)=>{
                if(err)
                  {
                    console.log(err)
                    return res.status(500).json({error: "Internal server error"});
                  }else
                  {
                    return res.json({
                      data: "Customer Deleted",
                      code: 200,
                    });
                  }
              });
            // }
        //   }
        // });
    });

    app.post('/vendorUpdate', uploadFiles, (req, res) => 
    {
      const { doc } = req.files;
      const {
          fname,
          lname,
          branch,
          address,
          mobile,
          pincode,
          city,
          email,
          cmpname,
          cmpgst,
          vid,
          addtype,
      } = req.body;
      const fullname=fname+" "+lname;
      const date = new Date();

      connection.query("SELECT * FROM vendor WHERE mobile = ? AND vid != ?", [mobile,vid], (err, rows) => {
          if (err) 
          {
              console.log(err);
              return res.status(500).json({ error: "Internal server error" });
          }else
          {
              if (rows.length > 0) 
              {
                  // return res.status(201).json("Mobile number already exists");
                  return res.json({
                      // data: result,
                      code: 201,
                  });
              }else
              {
                  let query = "UPDATE `vendor` SET `fname`=?, `lname`=?, `bid`=?, `address`=?,`mobile`=?, `pincode`=?, `city`=?,`full`=?,`dateup`=?,`email`=?,`cmpname`=?,`cmpgst`=?,`addtype`=?";
                  let queryParams = [
                      fname,
                      lname,
                      branch,
                      address,
                      mobile,
                      pincode,
                      city,
                      fullname,
                      date,
                      email,
                      cmpname,
                      cmpgst,
                      addtype,
                  ];
                  if (doc) {
                      query += ",`doc`=? ";
                      queryParams.push(path.join('public/vendor', doc[0].filename));
                  }
                  query += "WHERE `vid`=?";

                  queryParams.push(vid);
                  connection.query(query, queryParams, (err, result) => {
                      if (err) {
                          console.error("Error executing UPDATE query: ", err);
                          return res.status(500).json({ error: "Internal server error" });
                      } else {
                          if (result.affectedRows === 0) {
                              return res.status(404).json({ error: "Venodr not found" });
                          }
                          console.log("Vendor updated successfully:", result);
                          return res.json({
                              data: result,
                              code: 200,
                          });
                      }
                  });

              }
          }
      });
  });

  app.post("/venListIndividualSearch", (req, res) => {
    const bid = parseInt(req.body.bid);
    const searchTerm = req.body.searchTerm;
    if (searchTerm.trim() === "" || isNaN(bid)) {
      return res.json({
        code: 201,
      });
    }
    let query = "";
    if (bid === 0 || !bid) 
    {
        query="SELECT * FROM `vendor` WHERE `full` LIKE ?";
    }else
    {
        query="SELECT * FROM `vendor` WHERE `full` LIKE ? AND `bid`=?";
    }
    connection.query(query, [`%${searchTerm}%`, bid], (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal server error" });
        } else {
          if (rows.length > 0) {
            return res.json({
              data: rows,
              code: 200,
            });
          } else {
            return res.json({
              code: 201,
            });
          }
        }
      });
  })
}