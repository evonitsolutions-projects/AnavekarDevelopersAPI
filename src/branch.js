
module.exports = function (app, connection) {
    
    app.post("/branch", (req, res) => {
        console.log(req.body);
        const bname = req.body.bname;
        const adds = req.body.adds;
        const city = req.body.city;
        const pin = req.body.pin;
        const date = new Date();
        
        connection.query("SELECT * FROM branch WHERE brandName = ? OR pincode = ?", [bname, pin], (err, rows) => {
            if (err) 
            {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                if (rows.length > 0) {
                    const existingBranch = rows[0];
                    if (existingBranch.brandName === bname && existingBranch.pincode === pin) 
                    {
                        return res.json({
                            data: "Branch name and pincode already exist",
                            code: 201,
                        });
                    } else if (existingBranch.brandName === bname) 
                    {
                        return res.json({
                            data: "Branch name already exists",
                            code: 201,
                        });
                    } else if (existingBranch.pincode === pin) 
                    {
                        return res.json({
                            data: "Pincode already exists",
                            code: 201,
                        });
                    }
                }else {
                    connection.query("INSERT INTO branch (brandName, address, city, pincode, date) VALUES (?, ?, ?, ?, ?)", [bname, adds, city, pin, date], (err, result) => {
                        if (err) {
                            console.error("Error executing INSERT query: ", err);
                            return res.status(500).json({ error: "Internal server error" });
                        } else {
                            console.log("Branch added successfully:", result);
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

    app.post("/branchUpdate", (req, res) => {
        console.log(req.body);
        const bname = req.body.bname;
        const adds = req.body.adds;
        const city = req.body.city;
        const pin = req.body.pin;
        const bid=req.body.bid;
        const date = new Date();
        
        connection.query("SELECT * FROM branch WHERE (brandName = ? OR pincode = ?) AND id != ?", [bname, pin, bid], (err, rows) => {
            if (err) 
            {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                if (rows.length > 0) {
                    const existingBranch = rows[0];
                    if (existingBranch.brandName === bname && existingBranch.pincode === pin) 
                    {
                        return res.json({
                            data: "Branch name and pincode already exist",
                            code: 201,
                        });
                    } else if (existingBranch.brandName === bname) 
                    {
                        return res.json({
                            data: "Branch name already exists",
                            code: 201,
                        });
                    } else if (existingBranch.pincode === pin) 
                    {
                        return res.json({
                            data: "Pincode already exists",
                            code: 201,
                        });
                    }
                }else {
                    connection.query("UPDATE branch SET brandName = ?, address = ?, city = ?, pincode = ?, date = ? WHERE id = ?", [bname, adds, city, pin, date, bid], (err, result) => {
                        if (err) {
                            console.error("Error executing UPDATE query: ", err);
                            return res.status(500).json({ error: "Internal server error" });
                        } else {
                            if (result.affectedRows === 0) {
                                // If no rows were affected, it means the branch with the specified id doesn't exist
                                return res.status(404).json({ error: "Branch not found" });
                            } else {
                                console.log("Branch updated successfully:", result);
                                return res.json({
                                    data: result,
                                    code: 200,
                                });
                            }
                        }
                    });
                    
                }
            }
        });
    });

    app.post("/branchData", (req, res) => {
        connection.query("SELECT * FROM branch",(err, rows) => {
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

    app.post("/projects", (req, res) => {
        connection.query("SELECT * FROM project",(err, rows) => {
            if (err) 
            {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                if (rows.length > 0)
                {
                    console.log(rows)
                    return res.json({
                        data: rows,
                        code: 200,
                    });
                }else
                {
                    console.error("We Submitted Any project: ", err);
                    return res.status(200).json({ error: "Projects Are Empty" });
                }
            }
        });
    });
};