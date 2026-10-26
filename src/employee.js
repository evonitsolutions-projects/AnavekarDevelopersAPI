
const multer=require('multer');
const path=require('path');
module.exports = function (app, connection) 
{
    const upload=multer();
 
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, './public/employee');
        },
        filename: function (req, file, cb) 
        {
            // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.originalname);
        }
      });
    const uploadFiles = multer({ storage: storage }).fields([
        { name: 'photo', maxCount: 1 },
        { name: 'adhaar', maxCount: 1 },
        { name: 'pan', maxCount: 1 }
      ]);

    app.post('/employee', uploadFiles, (req, res) => {
        // console.log('Received form data:', req.body);
        // console.log('Received files:', req.files);
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
            designation,
            sallery,
            uname,
            pass
        } = req.body;
        const fullname=fname+" "+lname;
        const { photo, adhaar, pan } = req.files;
        const date = new Date();
        connection.query("SELECT * FROM employee WHERE mobile = ?", [mobile], (err, rows) => {
            if (err) 
            {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            }else
            {
                if (rows.length > 0)
                {
                    // return res.status(201).json({ error: "Mobile number already exists" });
                    return res.json({
                        // data: result,
                        code: 201,
                    });
                }else
                {
                    connection.query("SELECT * FROM login WHERE uname = ?", [uname], (err, rows) => {
                        if (err) 
                        {
                            console.log(err);
                            return res.status(500).json({ error: "Internal server error" });
                        }else
                        {
                            if (rows.length > 0) {
                                // return res.status(202).json({ error: "Username already exists" });
                                return res.json({
                                    // data: result,
                                    code: 202,
                                });
                            } else {
                                connection.query("INSERT INTO `employee`(`fname`, `lname`, `branch_id`, `address`, `dob`, `mobile`, `pincode`, `city`, `gender`, `age`, `designation`, `sallery`,`photo`, `adhaar`, `pan`, `regdate`,`full`) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
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
                                        designation,
                                        sallery,
                                        photo ? path.join('public/employee', photo[0].filename) : "",
                                        adhaar ? path.join('public/employee', adhaar[0].filename) : "",
                                        pan ? path.join('public/employee', pan[0].filename) : "",
                                        date,
                                        fullname
                                    ], (err, result) => {
                                    if (err) {
                                        console.error("Error executing INSERT query: ", err);
                                        return res.status(500).json({ error: "Internal server error" });
                                    }else
                                    {
                                        const empid = result.insertId;
                                        connection.query("INSERT INTO login (`empid`, `uname`, `pass`, `type`) VALUES (?, ?, ?, ?)", [empid, uname, pass, 'emp'], (err, result) => {
                                            if (err) {
                                                return res.status(500).json({ error: "Internal server error" });
                                            } else {
                                                console.log("Employee added successfully:", result);
                                                return res.json({
                                                    data: result,
                                                    code: 200,
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    });

    app.post("/empList", (req, res) => {
        connection.query("SELECT employee.*,branch.brandName FROM employee JOIN branch ON employee.branch_id = branch.id;",(err, rows) => {
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
                    return res.status(200).json({ error: "Branch Are Empty" });
                }
            }
        });
    });

    app.post("/empListIndividual", (req, res) => {
        // console.log(req.body.cid);
        const cid=req.body.emp_id;
        // connection.query("SELECT * FROM customer WHERE cid=?",[cid],(err, rows) => {
        connection.query("SELECT employee.*, branch.brandName FROM employee INNER JOIN branch ON employee.branch_id = branch.id WHERE employee.emp_id = ?", [cid], (err, rows) => {
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
                    return res.status(200).json({ error: "Customer Not" });
                }
            }
        });
    });

    app.post('/employeeUpdate', uploadFiles, (req, res) => {
        // console.log('Received form data:', req.body);
        // console.log('Received files:', req.files);
        // console.log(req.body);
        const {
            emp_id,
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
            designation,
            sallery,
            uname,
            pass
        } = req.body;
        const fullname=fname+" "+lname;
        const { photo, adhaar, pan } = req.files;
        const date = new Date();
        connection.query("SELECT * FROM employee WHERE mobile = ? AND emp_id !=?", [mobile,emp_id], (err, rows) => {
            if (err) 
            {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            }else
            {
                if (rows.length > 0) 
                {
                    // return res.status(201).json({ error: "Mobile number already exists" });
                    return res.json({
                        // data: result,
                        code: 201,
                    });
                }else
                {
                    let query = "UPDATE `employee` SET `fname`=?, `lname`=?, `branch_id`=?, `address`=?, `dob`=?, `mobile`=?, `pincode`=?, `city`=?, `gender`=?, `age`=?, `designation`=?,`full`=?,`sallery`=?, `dateup`=? ";
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
                                    designation,
                                    fullname,
                                    sallery,
                                    date
                                ];
                    if (photo) {
                        query += ",`photo`=? ";
                        queryParams.push(path.join('public/employee', photo[0].filename));
                    }

                    if (adhaar) {
                        query += ",`adhaar`=? ";
                        queryParams.push(path.join('public/employee', adhaar[0].filename));
                    }

                    if (pan) {
                        query += ",`pan`=? ";
                        queryParams.push(path.join('public/employee', pan[0].filename));
                    }

                    query += "WHERE `emp_id`=?";

                    queryParams.push(emp_id);
                    connection.query(query, queryParams, (err, result) => 
                    {
                        if (err) 
                        {
                            console.error("Error executing UPDATE query: ", err);
                            return res.status(500).json({ error: "Internal server error" });
                        } else
                        {
                            // console.log(result);
                            if (result.affectedRows === 0) 
                            {
                                return res.status(404).json({ error: "Employee not found" });
                            }
                            console.log("Employee updated successfully:", result);
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
};