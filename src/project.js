const { error } = require('console');

const multer=require('multer');
const path=require('path');
module.exports = function (app, connection) 
{
  
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, './public/project');
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.originalname);
        }
      });
    const uploadFiles = multer({ storage: storage }).fields([
        { name: 'sdeed', maxCount: 1 },
        { name: 'layouto', maxCount: 1 },
        { name: 'rtc', maxCount: 1 },
        { name: 'gpa', maxCount: 1 },
        { name: 'layoutI', maxCount: 1 },
        { name: 'kjpmap', maxCount: 1 },
        { name: 'mutationEnt', maxCount: 1 },
        { name: 'naorder', maxCount: 1 },
        { name: 'form1', maxCount: 1 },
        { name: 'form2', maxCount: 1 }
      ]);
    app.post('/project', uploadFiles, (req, res) => {
        // console.log('Received files:', req.files);
    
        // Destructure files from req.files
        const { sdeed, layouto, rtc, gpa, layoutI, kjpmap, mutationEnt, naorder, form1, form2 } = req.files;
    
        // Safely access filenames with conditional checks
        const sdeedFilename = sdeed && sdeed.length ? sdeed[0].path : '';
        // console.log(sdeedFilename)
        // console.log(sdeed)
        const layoutoFilename = layouto && layouto.length ? layouto[0].path : '';
        const rtcFilename = rtc && rtc.length ? rtc[0].path : '';
        const gpaFilename = gpa && gpa.length ? gpa[0].path : '';
        const layoutIFilename = layoutI && layoutI.length ? layoutI[0].path : '';
        const kjpmapFilename = kjpmap && kjpmap.length ? kjpmap[0].path : '';
        const mutationEntFilename = mutationEnt && mutationEnt.length ? mutationEnt[0].path : '';
        const naorderFilename = naorder && naorder.length ? naorder[0].path : '';
        const form1Filename = form1 && form1.length ? form1[0].path : '';
        const form2Filename = form2 && form2.length ? form2[0].path : '';
    
        // Use these filenames in your database query or wherever needed
    
        const {
            pname,
            lname,
            area,
            branch
        } = req.body;
    
        const date = new Date();
    
        connection.query("SELECT * FROM project WHERE pname = ?", [pname], (err, rows) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                if (rows.length > 0) {
                    return res.json({
                        code: 201,
                    });
                } else {
                    connection.query("INSERT INTO `project`(`bid`, `pname`, `location`, `area`, `saledeed`, `layout`, `rtc`, `gpa`, `layoutimage`, `kjpmap`, `mutation`, `naorder`, `form1`, `form2`, `regdate`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [
                        branch,
                        pname,
                        lname,
                        area,
                        sdeedFilename,
                        layoutoFilename,
                        rtcFilename,
                        gpaFilename,
                        layoutIFilename,
                        kjpmapFilename,
                        mutationEntFilename,
                        naorderFilename,
                        form1Filename,
                        form2Filename,
                        date
                    ], (err, result) => {
                        if (err) {
                            console.error("Error executing INSERT query: ", err);
                            return res.status(500).json({ error: "Internal server error" });
                        } else {
                            console.log("Project added Successfully:", result);
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
    

    app.post('/projectUpdate', uploadFiles, (req, res) => {
        const { sdeed, layouto, rtc, gpa, layoutI, kjpmap, mutationEnt, naorder, form1, form2} = req.files;
        const {
            pname,
            lname,
            area,
            branch,
            pid
        } = req.body;
        const date = new Date();
        connection.query("SELECT * FROM project WHERE pname = ? AND pid !=?", [pname,pid], (err, rows) => {
            if (err)
            {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            }else
            {
                if (rows.length > 0) 
                {
                    return res.json({
                        // data: result,
                        code: 201,
                    });
                }else
                {
                    let query="UPDATE `project` SET `bid`=?,`pname`=?,`location`=?,`area`=?";
                    let queryParams = [
                        branch,
                        pname,
                        lname,
                        area
                    ];
                    if (sdeed) {
                        query += ",`saledeed`=?";
                        queryParams.push(path.join('public/project', sdeed[0].filename));
                    }
                    if (layouto) {
                        query += ",`layout`=?";
                        queryParams.push(path.join('public/project', layouto[0].filename));
                    }
                    if (rtc) {
                        query += ",`rtc`=?";
                        queryParams.push(path.join('public/project', rtc[0].filename));
                    }
                    if (gpa) {
                        query += ",`gpa`=?";
                        queryParams.push(path.join('public/project', gpa[0].filename));
                    }
                    if (layoutI) {
                        query += ",`layoutimage`=?";
                        queryParams.push(path.join('public/project', layoutI[0].filename));
                    }
                    if (kjpmap) {
                        query += ",`kjpmap`=?";
                        queryParams.push(path.join('public/project', kjpmap[0].filename));
                    }
                    if (mutationEnt) {
                        query += ",`mutation`=?";
                        queryParams.push(path.join('public/project', mutationEnt[0].filename));
                    }
                    if (naorder) {
                        query += ",`naorder`=?";
                        queryParams.push(path.join('public/project', naorder[0].filename));
                    }
                    if (form1) {
                        query += ",`form1`=?";
                        queryParams.push(path.join('public/project', form1[0].filename));
                    }
                    if (form2) {
                        query += ",`form2`=?";
                        queryParams.push(path.join('public/project', form2[0].filename));
                    }
                    query += "WHERE `pid`=?";

                    queryParams.push(pid);
                    connection.query(query, queryParams, (err, result) => {
                        if (err) {
                            console.error("Error executing UPDATE query: ", err);
                            return res.status(500).json({ error: "Internal server error" });
                        } else {
                            if (result.affectedRows === 0) {
                                return res.status(404).json({ error: "Project not found" });
                            }
                            console.log("Project updated successfully:", result);
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
    app.post("/projectList", (req, res) => {
        console.log(req.body);
        const bid=parseInt(req.body.bid);
        let query = '';
        if (bid === 0 || !bid) {
            query = "SELECT * FROM project";
        } else {
            query = "SELECT * FROM project WHERE bid=?";
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
                    return res.status(200).json({ error: "Project Are Empty" });
                }
            }
        });
    });

    //Project List By Land
    app.post("/projectListByLand", (req, res) => {
        console.log(req.body);
        const bid=parseInt(req.body.bid);
        const land=parseInt(req.body.land);
        let query = '';
        if (bid === 0 || !bid) {
            query = `SELECT project.*, landowner.servey FROM project JOIN landowner ON project.pid = landowner.id WHERE landowner.id = ?;`;
        } else {
            query = `SELECT project.*, landowner.servey FROM project JOIN landowner ON project.pid = landowner.id WHERE landowner.id = ?;`;
        }
        connection.query(query,[land],(err, rows) => {
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
                    return res.status(200).json({ error: "Project Are Empty" });
                }
            }
        });
    });

    // app.post("/projectListByNameofForm", (req, res) => {
    //     console.log(req.body);
    //     const bid=parseInt(req.body.bid);
    //     const cid=parseInt(req.body.cid);
    //     let query = '';
    //     if (bid === 0 || !bid) {
    //         query="SELECT * FROM project JOIN plotsale ON project.pid = plotsale.pid WHERE plotsale.cid = ? AND plotsale.bid = ?;";
    //     } else 
    //     {
    //         query="SELECT * FROM project JOIN plotsale ON project.pid = plotsale.pid WHERE plotsale.cid = ? AND plotsale.bid = ?;";
    //     }
    //     connection.query(query,[cid,bid],(err, rows) => {
    //         if (err) 
    //         {
    //             console.log(err);
    //             return res.status(500).json({ error: "Internal server error" });
    //         } else {
    //             if (rows.length > 0)
    //             {
    //                 console.log(rows.length);
    //                 const plotdata=[];
    //                 for(var i=0; i < rows.length; i++)
    //                 {
    //                     let sid=rows[i].id;
    //                     const query1=`SELECT plots.*
    //                                     FROM saleplotdetails
    //                                     JOIN plots ON saleplotdetails.plotid = plots.id
    //                                     WHERE saleplotdetails.sid = ?;
    //                                     `;
    //                     connection.query(query1,[sid],(err,plotrows)=>{
    //                         if (err) 
    //                         {
    //                             console.log(err);
    //                         }else
    //                         {
    //                             console.log(plotrows);
    //                             if (plotrows.length > 0)
    //                             {
    //                                 plotdata.push(plotrows);
    //                             }
    //                         }
    //                     });
    //                 }
    //                 return res.json({
    //                     data: rows,
    //                     data1: plotdata,
    //                     code: 200,
    //                 });
    //             }else
    //             {
    //                 return res.status(200).json({ error: "Project Are Empty" });
    //             }
    //         }
    //     });
    // });

    app.post("/projectListByNameofForm", async (req, res) => {
        console.log(req.body);
        const bid = parseInt(req.body.bid);
        const cid = parseInt(req.body.cid);
    
        const query1 = "SELECT * FROM project JOIN plotsale ON project.pid = plotsale.pid WHERE plotsale.cid = ? AND plotsale.bid = ?;";
        
        try {
            const rows = await queryAsync(query1, [cid, bid]);
    
            if (rows.length === 0) {
                return res.status(200).json({ error: "Projects are empty" });
            }
    
            // Create an array of promises to fetch plotdata for each project
            const plotPromises = rows.map(async (row) => {
                const sid = row.id;
                const query2 = `SELECT plots.*
                                FROM saleplotdetails
                                JOIN plots ON saleplotdetails.plotid = plots.id
                                WHERE saleplotdetails.sid = ?;`;
                return queryAsync(query2, [sid]);
            });
    
            // Wait for all plotPromises to resolve
            const plotdata = await Promise.all(plotPromises);
            console.log(plotdata);
            return res.json({
                data: rows,
                data1: plotdata,
                code: 200,
            });
    
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal server error" });
        }
    });

    function queryAsync(sql, params) {
        return new Promise((resolve, reject) => {
            connection.query(sql, params, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }

    app.post("/proIndividual", (req, res) => {
        console.log(req.body.pid);
        const pid=req.body.pid;
        // connection.query("SELECT * FROM customer WHERE cid=?",[cid],(err, rows) => {
        connection.query("SELECT project.*, branch.brandName FROM project INNER JOIN branch ON project.bid = branch.id WHERE project.pid = ?", [pid], (err, rows) => {
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
                    return res.status(200).json({ error: "Project Not" });
                }
            }
        });
    });

    app.post("/projectData", (req, res) => {
        console.log(req.body.bid);
        const bid=req.body.bid;
        // connection.query("SELECT * FROM customer WHERE cid=?",[cid],(err, rows) => {
        connection.query("SELECT project.* FROM project WHERE project.bid = ?", [bid], (err, rows) => {
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
                    return res.status(201).json({ error: "Project Not" });
                }
            }
        });
    });
    //PROJECT OVERALL DETAILS
    app.post("/projectoveralldetails", (req, res) => {
        // console.log(req.body.pid);
        const pid=req.body.pid;
        var query=`SELECT 
                plotsale.*, 
                saleplotdetails.*, 
                customer.fullname,
                plots.plotnum,
                plots.area,
                (SELECT SUM(transaction.Amount) 
                FROM transaction 
                WHERE transaction.sid = plotsale.id) AS total_paid,
                (SELECT SUM(transaction.Amount) 
                FROM transaction 
                WHERE transaction.sid = plotsale.id) / 
                (SELECT COUNT(DISTINCT saleplotdetails.id) 
                FROM saleplotdetails 
                WHERE saleplotdetails.sid = plotsale.id) AS payment_per_plot
            FROM 
                plotsale
            INNER JOIN 
                customer ON customer.cid = plotsale.cid
            INNER JOIN 
                saleplotdetails ON saleplotdetails.sid = plotsale.id
            INNER JOIN 
                plots ON plots.id = saleplotdetails.plotid
            WHERE 
                plotsale.pid = ?;`

    Promise.all([
        new Promise((resolve, reject) => {
            connection.query(query,[pid],(err, rows) => { 
                if(err)
                {
                    console.log(err);
                    // return res.status(500).json({error: "Inernal Server error"});
                    reject(err);
                }
                else
                {
                    // return res.json({
                    //     data: rows,
                    //     code: 200,
                    // });
                    resolve(rows);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(`SELECT t.*, 
                                    c.category AS catname, 
                                    l.name AS landname
                                FROM transaction t
                                LEFT JOIN category c ON t.category = c.id
                                LEFT JOIN landowner l ON t.landownerid = l.id
                                WHERE t.pid = ?
                                AND (t.landownerid IS NULL OR l.name IS NOT NULL);
                                `
                                ,[pid],(err,rows)=>
            {
                if(err)
                {
                    console.log(err);
                    // return res.status(500).json({error:"Inernal Server error"});
                    reject(err);
                }else
                {
                    // return res.json({
                    //     data:rows,
                    //     code:200,
                    // })
                    resolve(rows);
                }
            });
        })
    ])
    .then(([data1, data2]) => {
        res.status(200).json({ 
            data1: data1,
            data2: data2,
            code: 200
        });
    })
    .catch(error => {
        console.error("Internal Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
    });

    app.post("/projectoveralldetailsReport", (req, res) => {
        const bid = req.body.bid;

        // First, get all pid associated with the given bid
        const getPidsQuery = `SELECT pid,pname FROM project WHERE bid=?`;
    
        connection.query(getPidsQuery, [bid], (err, pids) => {
            if (err) {
                console.error("Error fetching pids:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
    
            if (pids.length === 0) {
                return res.status(404).json({ error: "No projects found for the given bid" });
            }
    
            // Array to hold all the promises
            const promises = pids.map(pidObj => {
                // console.log(pidObj);
                const pid = pidObj.pid;
                const pname = pidObj.pname;
    
                const projectDetailsQuery = `
                    SELECT 
                        plotsale.*, 
                        saleplotdetails.*, 
                        customer.fullname,
                        plots.plotnum,
                        plots.area,
                        (SELECT SUM(transaction.Amount) 
                         FROM transaction 
                         WHERE transaction.sid = plotsale.id) AS total_paid,
                        (SELECT SUM(transaction.Amount) 
                         FROM transaction 
                         WHERE transaction.sid = plotsale.id) / 
                        (SELECT COUNT(DISTINCT saleplotdetails.id) 
                         FROM saleplotdetails 
                         WHERE saleplotdetails.sid = plotsale.id) AS payment_per_plot
                    FROM 
                        plotsale
                    INNER JOIN 
                        customer ON customer.cid = plotsale.cid
                    INNER JOIN 
                        saleplotdetails ON saleplotdetails.sid = plotsale.id
                    INNER JOIN 
                        plots ON plots.id = saleplotdetails.plotid
                    WHERE 
                        plotsale.pid = ?;
                `;
    
                const tempExpenseQuery = `SELECT t.*, 
                                    c.category AS catname, 
                                    l.name AS landname
                                FROM transaction t
                                LEFT JOIN category c ON t.category = c.id
                                LEFT JOIN landowner l ON t.landownerid = l.id
                                WHERE t.pid = ?
                                AND (t.landownerid IS NULL OR l.name IS NOT NULL);
                            `;
    
                // Create a promise to get project details
                const projectDetailsPromise = new Promise((resolve, reject) => {
                    connection.query(projectDetailsQuery, [pid], (err, rows) => {
                        if (err) {
                            console.error("Error fetching project details:", err);
                            reject(err);
                        } else {
                            resolve({ pid, pname,projectDetails: rows });
                        }
                    });
                });
    
                // Create a promise to get temp expenses
                const tempExpensePromise = new Promise((resolve, reject) => {
                    connection.query(tempExpenseQuery, [pid], (err, rows) => {
                        if (err) {
                            console.error("Error fetching temp expenses:", err);
                            reject(err);
                        } else {
                            resolve({ pid,pname, tempExpenses: rows });
                        }
                    });
                });
                // Return a combined promise that resolves with both project details and temp expenses
                return Promise.all([projectDetailsPromise, tempExpensePromise])
                    .then(([projectDetails, tempExpenses]) => ({
                        pid: projectDetails.pid,
                        pname: projectDetails.pname,
                        projectDetails: projectDetails.projectDetails,
                        tempExpenses: tempExpenses.tempExpenses
                    }));
            });
    
            // Wait for all promises to resolve
            Promise.all(promises)
                .then(results => {
                    res.status(200).json({ 
                        data: results,
                        code: 200
                    });
                })
                .catch(error => {
                    console.error("Internal Server Error:", error);
                    res.status(500).json({ error: "Internal Server Error" });
                });
        });
    });
    
    
}