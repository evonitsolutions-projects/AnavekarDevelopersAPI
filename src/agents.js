
const multer=require('multer');
const path=require('path');
module.exports = function (app, connection) 
{
  
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, './public/agent');
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.originalname);
        }
      });
    const uploadFiles = multer({ storage: storage }).fields([
        { name: 'photo', maxCount: 1 },
        { name: 'adhaar', maxCount: 1 },
        { name: 'pan', maxCount: 1 },
      ]);

      app.post('/agent', uploadFiles, (req, res) => {
        const { photo, adhaar, pan} = req.files;
        const {
            fname,
            lname,
            branch,
            address,
            mobile,
            email,
            pincode,
            city,
            uid,
        } = req.body;
        const fullname=fname+" "+lname;
        const date = new Date();
        connection.query("SELECT * FROM agents WHERE mobile = ?", [mobile], (err, rows) => {
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
                    connection.query("INSERT INTO `agents`(`fname`, `lname`, `mobile`, `email`, `adds`, `city`, `pincode`, `branch`, `photo`, `adhar`, `pan`, `full`, `regdate`,`uid`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[
                        fname,
                        lname,
                        mobile,
                        email,
                        address,
                        city,
                        pincode,
                        branch,
                        photo ? path.join('public/agent', photo[0].filename) : '',
                        adhaar ? path.join('public/agent', adhaar[0].filename) : '',
                        pan ? path.join('public/agent', pan[0].filename) : '',
                        fullname,
                        date,
                        uid
                    ],(err,result)=>{
                        if(err)
                        {
                            console.error("Error executing INSERT query: ", err);
                            return res.status(500).json({ error: "Internal server error" });
                        }else
                        {
                            console.log("Agent added successfully:", result);
                            return res.json({
                                data: result,
                                code: 200,
                            });
                        }
                    })
                }
                // INSERT INTO `customer`(`cid`, `fname`, `lname`, `bid`, `adds`, `dob`, `mobile`, `pincode`, `city`, `gender`, `age`, `occ`, `photo`, `adhaar`, `pan`, `other`, `regdate`, `dateup`, `status`) VALUES ('[value-1]','[value-2]','[value-3]','[value-4]','[value-5]','[value-6]','[value-7]','[value-8]','[value-9]','[value-10]','[value-11]','[value-12]','[value-13]','[value-14]','[value-15]','[value-16]','[value-17]','[value-18]','[value-19]')
            }
        });
      });

      app.post("/agentList", (req, res) => {
        const bid = parseInt(req.body.bid);
        let query = '';
        if (bid === 0 || !bid) {
            query = "SELECT * FROM agents";
        } else {
            query = "SELECT * FROM agents WHERE branch = ?";
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
                    return res.json({
                        data: rows,
                        code: 201,
                    });
                    // return res.status(200).json({ error: "agents Are Empty" });
                }
            }
        });
    });

    app.post("/AgeListIndividual", (req, res) => {
        console.log(req.body.aid);
        const aid=req.body.aid;
        // connection.query("SELECT * FROM customer WHERE cid=?",[cid],(err, rows) => {
        connection.query("SELECT agents.*, branch.brandName FROM agents INNER JOIN branch ON agents.branch = branch.id WHERE agents.aid = ?", [aid], (err, rows) => {
            if (err) 
            {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                if (rows.length > 0)
                {
                    console.log(rows);
                    return res.json({
                        data: rows,
                        code: 200,
                    });
                }else
                {
                    return res.status(200).json({ error: "Customer Not" });
                }
            }
        });
    });
    app.post('/agentupdate', uploadFiles, (req, res) => {
        // console.log('Received form data:', req.body);
        // console.log('Received files:', req.files);
        // console.log(req.body);
        const { photo, adhaar, pan} = req.files;
        const {
            fname,
            lname,
            branch,
            address,
            mobile,
            email,
            pincode,
            city,
            aid,
        } = req.body;
        const fullname=fname+" "+lname;
        const date = new Date();

        connection.query("SELECT * FROM agents WHERE mobile = ? AND aid != ?", [mobile,aid], (err, rows) => {
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
                    let query = "UPDATE `agents` SET `fname`=?, `lname`=?, `branch`=?, `adds`=?, `mobile`=?,`email`=?, `pincode`=?, `city`=?,`full`=?, `dateup`=? ";
                    let queryParams = [
                        fname,
                        lname,
                        branch,
                        address,
                        mobile,
                        email,
                        pincode,
                        city,
                        fullname,
                        date
                    ];
                    if (photo) {
                        query += ",`photo`=? ";
                        queryParams.push(path.join('public/customer', photo[0].filename));
                    }

                    if (adhaar) {
                        query += ",`adhaar`=? ";
                        queryParams.push(path.join('public/customer', adhaar[0].filename));
                    }

                    if (pan) {
                        query += ",`pan`=? ";
                        queryParams.push(path.join('public/customer', pan[0].filename));
                    }
                    query += "WHERE `aid`=?";

                    queryParams.push(aid);

                    connection.query(query, queryParams, (err, result) => {
                        if (err) {
                            console.error("Error executing UPDATE query: ", err);
                            return res.status(500).json({ error: "Internal server error" });
                        } else {
                            if (result.affectedRows === 0) {
                                return res.status(404).json({ error: "Agent not found" });
                            }
                            console.log("Agent updated successfully:", result);
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

    app.post("/deleteAgent", (req, res) => {
        const aid = parseInt(req.body.aid);
        let query = "";
        let type=0;
        connection.query("SELECT `refid` FROM `referal` WHERE `refid` = ? AND `type`=? ", [aid,type], (err, rows) => {
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
              connection.query("Delete FROM `agents` WHERE `aid`=?",[aid],(err,rows1)=>{
                if(err)
                  {
                    console.log(err)
                    return res.status(500).json({error: "Internal server error"});
                  }else
                  {
                    return res.json({
                      data: "Agent Deleted",
                      code: 200,
                    });
                  }
              });
            }
          }
        });
    });
}