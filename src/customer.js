const multer = require("multer");
const path = require("path");
module.exports = function (app, connection) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/customer");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.originalname);
    },
  });
  const uploadFiles = multer({ storage: storage }).fields([
    { name: "photo", maxCount: 1 },
    { name: "adhaar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "other", maxCount: 1 },
  ]);

  app.post("/customer", uploadFiles, (req, res) => {
    // console.log('Received form data:', req.body);
    // console.log('Received files:', req.files);
    const { photo, adhaar, pan, other } = req.files;
    const {
      fname,
      lname,
      branch,
      address,
      dob,
      mobile,
      pincode,
      city,
      gender,
      age,
      occu,
      uid,
      adharnum,
      pannum,
      email,
    } = req.body;
    const fullname = fname + " " + lname;
    const date = new Date();

    connection.query(
      "SELECT * FROM customer WHERE mobile = ?",
      [mobile],
      (err, rows) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal server error" });
        } else {
          if (rows.length > 0) {
            // return res.status(200).json({ error: "Mobile number already exists" });
            return res.json({
              // data: result,
              code: 201,
            });
          } else {
            connection.query(
              "INSERT INTO `customer`(`fname`, `lname`, `bid`, `adds`, `dob`, `mobile`, `pincode`, `city`, `gender`, `age`, `occ`, `photo`, `adhaar`, `pan`, `other`, `regdate`,`fullname`,`uid`,`adharNum`,`panNum`,`email`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
              [
                fname,
                lname,
                branch,
                address,
                dob,
                mobile,
                pincode,
                city,
                gender,
                age,
                occu,
                photo ? path.join("public/customer", photo[0].filename) : "",
                adhaar ? path.join("public/customer", adhaar[0].filename) : "",
                pan ? path.join("public/customer", pan[0].filename) : "",
                other ? path.join("public/customer", other[0].filename) : "",
                date,
                fullname,
                uid,
                adharnum,
                pannum,
                email,
              ],
              (err, result) => {
                if (err) {
                  console.error("Error executing INSERT query: ", err);
                  return res
                    .status(500)
                    .json({ error: "Internal server error" });
                } else {
                  console.log("Customer added successfully:", result);
                  return res.json({
                    data: result,
                    code: 200,
                  });
                }
              }
            );
          }
          // INSERT INTO `customer`(`cid`, `fname`, `lname`, `bid`, `adds`, `dob`, `mobile`, `pincode`, `city`, `gender`, `age`, `occ`, `photo`, `adhaar`, `pan`, `other`, `regdate`, `dateup`, `status`) VALUES ('[value-1]','[value-2]','[value-3]','[value-4]','[value-5]','[value-6]','[value-7]','[value-8]','[value-9]','[value-10]','[value-11]','[value-12]','[value-13]','[value-14]','[value-15]','[value-16]','[value-17]','[value-18]','[value-19]')
        }
      }
    );
    // console.log(photo)
    // console.log(adhaar)
  });

  app.post("/CustListBySearch", (req, res) => {
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
      query = "SELECT * FROM customer WHERE fullname LIKE ?";
    } else {
      query = "SELECT * FROM customer WHERE fullname LIKE ? AND bid = ?";
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
  });

  app.post("/CustListIndividual", (req, res) => {
    // console.log(req.body.cid);
    const cid = req.body.cid;
    // connection.query("SELECT * FROM customer WHERE cid=?",[cid],(err, rows) => {
    connection.query(
      "SELECT customer.*, branch.brandName FROM customer INNER JOIN branch ON customer.bid = branch.id WHERE customer.cid = ?",
      [cid],
      (err, rows) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal server error" });
        } else {
          if (rows.length > 0) {
            return res.json({
              data: rows,
              code: 200,
            });
          } else {
            return res.status(200).json({ error: "Customer Not" });
          }
        }
      }
    );
  });

  app.post("/customerupdate", uploadFiles, (req, res) => {
    // console.log('Received form data:', req.body);
    // console.log('Received files:', req.files);
    // console.log(req.body);
    const { photo, adhaar, pan, other } = req.files;
    const {
      fname,
      lname,
      branch,
      address,
      dob,
      mobile,
      pincode,
      city,
      gender,
      age,
      occu,
      cid,
      uid,
      adharnum,
      pannum,
      email,
    } = req.body;
    const fullname = fname + " " + lname;
    const date = new Date();

    connection.query(
      "SELECT * FROM customer WHERE mobile = ? AND cid != ?",
      [mobile, cid],
      (err, rows) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal server error" });
        } else {
          if (rows.length > 0) {
            // return res.status(201).json("Mobile number already exists");
            return res.json({
              // data: result,
              code: 201,
            });
          } else {
            let query =
              "UPDATE `customer` SET `fname`=?, `lname`=?, `bid`=?, `adds`=?, `dob`=?, `mobile`=?, `pincode`=?, `city`=?, `gender`=?, `age`=?, `occ`=?, `fullname`=?, `dateup`=?, `adharNum`=?, `panNum`=?, `email`=?";
            let queryParams = [
              fname,
              lname,
              branch,
              address,
              dob,
              mobile,
              pincode,
              city,
              gender,
              age,
              occu,
              fullname,
              date,
              adharnum,
              pannum,
              email,
            ];

            if (photo) {
              query += ", `photo`=?";
              queryParams.push(path.join("public/customer", photo[0].filename));
            }

            if (adhaar) {
              query += ", `adhaar`=?";
              queryParams.push(
                path.join("public/customer", adhaar[0].filename)
              );
            }

            if (pan) {
              query += ", `pan`=?";
              queryParams.push(path.join("public/customer", pan[0].filename));
            }

            if (other) {
              query += ", `other`=?";
              queryParams.push(path.join("public/customer", other[0].filename));
            }

            query += " WHERE `cid`=?";
            queryParams.push(cid);

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
          }
        }
      }
    );
  });

  app.post("/CustList", (req, res) => {
    const bid = parseInt(req.body.bid);
    let query = "";
    if (bid === 0 || !bid) {
      query = "SELECT * FROM customer";
    } else {
      query = "SELECT * FROM customer WHERE bid = ?";
    }
    connection.query(query, [bid], (err, rows) => {
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
          return res.status(200).json({ error: "Customer Not Found" });
        }
      }
    });
  });

  app.post("/deleteCustomer", (req, res) => {
    const cid = parseInt(req.body.cid);
    let query = "";

    connection.query("SELECT `cid` FROM `plotsale` WHERE `cid` = ?", [cid], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        if (rows.length > 0) 
        {
            return res.json({
              data: rows,
              code: 201,
            });
        } else 
        {
          connection.query("Delete FROM `customer` WHERE `cid`=?",[cid],(err,rows1)=>{
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
        }
      }
    });
  });
};
