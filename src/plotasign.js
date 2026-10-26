
const multer = require('multer');
const path = require('path');
const branch = require('./branch');
const { query } = require('express');
const fs = require('fs');

module.exports = function (app, connection) {
  
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/plots');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    });

    const upload = multer({ storage: storage });

    app.post('/plotAsign', upload.array('plots'), async (req, res) => 
    {
        const plotArea = JSON.parse(req.body.plotArea);
        const plotnumber = JSON.parse(req.body.plotNumber);
        const pids=JSON.parse(req.body.pid);
        const rdpr=JSON.parse(req.body.rdpr);
        const {branch, pname, uid }=req.body;
        // console.log(pname);
        const date = new Date();
        // console.log(req.body);
        // res.json({
        //     message: 'Plots Uploaded successfully',
        //     code: 200,
        // });
        // return;
        try
            {
                const existingPlots = await new Promise((resolve, reject) => {
                    connection.query("SELECT plotnum FROM `plots` WHERE `pid`=? AND `plotnum` IN (?)", [pname,plotnumber], (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });
                const existingPlotNumbers = existingPlots.map(plot => plot.plotnum);
                const duplicates = plotnumber.filter(plot => existingPlotNumbers.includes(plot));
                if (duplicates.length > 0) {
                    return res.json({
                        message: 'One or more plot numbers already exist',
                        code: 201,
                    });
                }
                for (let i = 0; i < req.files.length; i++) 
                {
                    const imageData = req.files[i];
                    // console.log(imageData);
                    connection.query("INSERT INTO `plots`(`pid`, `plotnum`, `area`, `plotimage`,`uid`,`regdate`,`pidnum`,`rdpr`) VALUES(?,?,?,?,?,?,?,?)",
                        [
                            pname,
                            plotnumber[i],
                            plotArea[i],
                            imageData ? path.join('public/plots', imageData.filename) : null,
                            uid,
                            date,
                            pids[i],
                            rdpr[i]
                        ],(err,result)=>{
                        if(err)
                        {
                            console.error("Error executing INSERT query: ", err);
                            return res.status(500).json({ error: "Internal server error" });
                        }else
                        {
                            // console.log("plots added successfully:", result);
                        }
                    })
                }
                res.json({
                    message: 'Plots Uploaded successfully',
                    code: 200,
                });
            } catch (error) {
                console.error("Error executing INSERT query: ", error);
                res.status(500).json({ error: "Internal server error" });
            }
    });

    app.post("/proIndividualplotChange", (req, res) => {
        // console.log(req.body.pid);
        const pid=req.body.pid;
        // let query=`SELECT project.pname,project.location,project.area AS parea,plots.* FROM project JOIN plots ON project.pid=plots.pid WHERE project.pid=?`;
        let query=`SELECT project.pname, project.location, project.area AS parea, plots.*
        FROM project
        LEFT JOIN plots ON project.pid = plots.pid
        WHERE project.pid = ?`;
        connection.query(query,[pid],(err,rows)=>{
            if (err) 
            {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                if (rows.length > 0)
                {
                    // console.log(rows);
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
    app.post("/removeplot", (req, res) => {
        // console.log(req.body.id);
        const id=req.body.id;
        connection.query("DELETE FROM plots WHERE id=?",[id],(err,rows)=>{
            if(err)
            {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            }else
            {
                // console.log(rows);
                console.log("Plot Removed Successfully");
                return res.json({
                    data: rows,
                    code: 200,
                });
            }
        });
    });

    app.post("/plotList", (req, res) => {
        const bid=parseInt(req.body.bid);
        // console.log(bid);
        if(bid==0)
        {
            connection.query("SELECT pr.*, COUNT(p.id) AS plotcount,SUM(p.res = 0) AS available_plots,SUM(p.res = 1) AS unavailable_plots FROM project pr LEFT JOIN plots p ON p.pid=pr.pid GROUP BY pr.pid HAVING plotcount > 0",(err,result)=>{
                if(err)
                {
                    console.error("Error executing INSERT query: ", err);
                    return res.status(500).json({ error: "Internal server error" });
                }else
                {
                    return res.json({
                        data: result,
                        code: 200,
                    });
                }
            });
        }else
        {
            const query="SELECT pr.*, COUNT(p.id) AS plotcount,SUM(p.res = 0) AS available_plots,SUM(p.res = 1) AS unavailable_plots FROM project pr LEFT JOIN plots p ON p.pid = pr.pid WHERE pr.bid = ? GROUP BY pr.pid  HAVING plotcount > 0";
            connection.query(query,[bid],(err,result)=>{
                if(err)
                {
                    console.error("Error executing INSERT query: ", err);
                    return res.status(500).json({ error: "Internal server error" });
                }else
                {
                    return res.json({
                        data: result,
                        code: 200,
                    });
                }
            });
        }
    });

    app.post("/plotIndividual", (req, res) => {
        const pid=req.body.pid;
        connection.query("SELECT * FROM plots WHERE pid=?",[pid],(err, rows) => {
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
                    return res.status(200).json({ error: "Plots Not Found" });
                }
            }
        });
    });
    
    app.post("/projectChange", (req, res) => {
        const pid=req.body.pid;
        connection.query("SELECT plots.*, project.pname, project.area AS parea,project.location FROM plots JOIN project ON plots.pid = project.pid WHERE plots.pid = ? AND plots.res = 0",[pid],(err,result)=>{
            if(err)
            {
                console.error("Error executing INSERT query: ", err);
                return res.status(500).json({ error: "Internal server error" });
            }else
            {
                return res.json({
                    data: result,
                    code: 200,
                });
            }
        });
    });


    app.post("/CustReferedSearch", (req, res) => {
        const bid = parseInt(req.body.bid);
        const searchTerm =req.body.searchTerm;
        const referredBy =req.body.referredBy;
        let tabno='';
        let query = '';
        let branchlds='';
        let namefeilds='';
        let id='';
       // referredBy 0 =AGENT || 1=CUSTOMER || 2=EMPLOYEE || 3=VENDOR
        if(referredBy==0)
        {
            tabno='agents';
            branchlds='branch';
            namefeilds='full';
            id='aid';
        }else if(referredBy==1)
        {
            tabno='customer';
            branchlds='bid';
            namefeilds='fullname';
            id='cid';
        }else if(referredBy==2)
        {
            tabno='employee';    
            branchlds='branch_id';
            namefeilds='full';
            id='emp_id';
        }else if(referredBy==3)
        {
            tabno='vendor';
            branchlds='bid';
            namefeilds='full';
            id='vid';
        }
        query = `SELECT ${id} AS id, ${namefeilds} AS fullname, mobile FROM ${tabno} WHERE ${branchlds} = ? AND ${namefeilds} LIKE ?`;
        
        if(searchTerm.trim() === '' || isNaN(bid))
        {
            return res.json({
                code: 201,
            });
        }
        connection.query(query, [bid,`%${searchTerm}%`], (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                if (rows.length > 0) {
                    return res.json({
                        data: rows,
                        code: 200,
                    });
                } else 
                {
                    return res.json({
                        code: 201,
                    });
                }
            }
        });
    });

    const uploadFiles = multer({ storage: storage }).fields([
        { name: 'agreement', maxCount: 1 },
        { name: 'chequee', maxCount: 1 },
        { name: 'saledeed', maxCount: 1 },
    ]);
    app.post("/saleplot",uploadFiles, (req, res) => {
        // console.log('Received files:', req.files);
        let plotamt=0;
        let paid=0;
        const { agreement, chequee, saledeed}=req.files;
        const { cid , pid ,bid, totalSquareFeet, totalAmount, pricepersp, paymentType, downPay, remainAmt, paymentMode, referredBy, refname,refid, date,cheque,trans,commision}=req.body;
        const regdate = new Date();
        const plotData = JSON.parse(req.body.plotData);
        const agreementfilename = agreement && agreement.length ? agreement[0].path : '';
        const chequeefilename = chequee && chequee.length ? chequee[0].path : '';
        const saledeedfilename = saledeed && saledeed.length ? saledeed[0].path : '';
        let payType=parseInt(paymentType);
        if(payType==0)
        {
            paid=totalAmount;
        }else if(payType==1)
        {
            paid=downPay;
        }
        let details='';
        if(cheque=='')
        {
            details=trans;
        }
        connection.query("INSERT INTO `plotsale`(`cid`,`pid`,`totalsf`,`totalamt`,`pricesf`,`paymentType`,`date`,`regdate`,`bid`,`cheque`,`agreement`,`saledeed`)VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
        [
            cid,
            pid,
            totalSquareFeet,
            totalAmount,
            pricepersp,
            paymentType,
            date,
            regdate,
            bid,
            chequeefilename,
            agreementfilename,
            saledeedfilename
        ],(err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Internal server error" });
            }else
            {
                const saleId = rows.insertId;
                // console.log(saleId);
                plotData.forEach((plot, index) => 
                {
                    plotamt=(pricepersp*plot.area)
                    connection.query("INSERT INTO `saleplotdetails`(`sid`,`plotid`,`plotamt`)VALUES(?,?,?)",
                        [
                            saleId,
                            plot.id,
                            plotamt,

                        ],(err,result)=>{
                            if(err)
                            {
                                console.error(err);
                                return res.status(500).json({ error: "Internal server error" });
                            }else{
                            //    console.log(result); 
                            }
                    });
                    connection.query("UPDATE `plots` SET `res`=1 WHERE `id`=?",[plot.id],(err,plotup)=>{
                        if(err)
                        {
                            console.error(err);
                            return res.status(500).json({ error: "Internal server error" });
                        }else
                        {
                            // console.log(plotup);
                        }
                    });
                });
                connection.query("INSERT INTO `payment`( `sid`, `totalamt`, `downpayment`, `remain`,`paid`,`pmode`, `cheque`, `date`) VALUES(?,?,?,?,?,?,?,?)",
                [
                    saleId,
                    totalAmount,
                    downPay,
                    remainAmt,
                    paid,
                    paymentMode,
                    details, //checque or bank transaction id
                    date
                ],(err,pay)=>{
                    if(err)
                    {
                        console.error(err);
                        return res.status(500).json({ error: "Internal server error" });
                    }else{
                    //    console.log(pay); 
                    }
                });

                if(referredBy !=4)
                {
                    connection.query("INSERT INTO `referal`(`saleid`,`refid`,`type`,`commition`) VALUES(?,?,?,?)",
                    [
                        saleId,
                        refid,
                        referredBy,
                        commision
                    ],(err,ref)=>{
                        if(err)
                        {
                            console.error(err);
                            return res.status(500).json({ error: "Internal server error" });
                        }else{
                        // console.log(ref); 
                        }
                    });
                    return res.json({
                        data: "Plot Salled Successfully",
                        code: 200,
                    });
                }else
                {
                    return res.json({
                        data: "Plot Salled Successfully",
                        code: 200,
                    });
                }
            }
        });
    });

    // const uploadplotImage = multer({ storage: storage }).fields([
    //     { name: 'image', maxCount: 1 },
    // ]);
    const storage1 = multer.memoryStorage();

    const uploadplotImage = multer({ storage: storage1 }).fields([
    { name: 'image', maxCount: 1 },
    ]);
    app.post("/updateperticularPlot", uploadplotImage, (req, res) => {
        // console.log(req.body);
        // console.log(req.files);
        const {id,plotnumber,area,pidnum,rdpr,pname,branch,originalplonum}=req.body;
        const image=req.files;
        const regdate = new Date();
        connection.query("SELECT * FROM `plots` WHERE `plotnum`=? AND `plotnum` != ? AND `pid`=?",[plotnumber,originalplonum,pname],(err,rows)=>{
            if(err)
            {
                console.error(err);
                return res.status(500).json({ error: "Internal server error" });
            }else
            {
                // console.log(rows);
                if(rows.length > 0)
                {
                    return res.json({
                        data: "Plot Already Exists",
                        code: 201,
                    });
                }else
                {
                    if(image && image.image) 
                    {
                        const uploadDir = './public/plots/';
                        const filename = `${Date.now()}${path.extname(image.image[0].originalname)}`;
                        const filePath = `${uploadDir}${filename}`;
                        fs.writeFileSync(filePath, image.image[0].buffer);
                        // console.log("public/plots/"+filename);
                        const filename1="public/plots/"+filename;
                        connection.query("UPDATE `plots` SET `plotnum`=?, `area`=?, `pidnum`=?, `rdpr`=?, `plotimage`=?,`dateup`=? WHERE `id`=?",[plotnumber, area, pidnum, rdpr,filename1, regdate,id],(err, rows)=>{
                          if(err)
                          {
                            console.error(err);
                            return res.status(500).json({ error: "Internal server error" });
                          }else
                          {
                            return res.json({
                              data: "Plot Updated Successfully",
                              code: 200,
                            });
                          }
                        });
                    } else {
                        connection.query("UPDATE `plots` SET `plotnum`=?, `area`=?, `pidnum`=?, `rdpr`=?,`dateup`=? WHERE `id`=?",[plotnumber, area, pidnum, rdpr,regdate,id],(err, rows)=>{
                          if(err)
                          {
                            console.error(err);
                            return res.status(500).json({ error: "Internal server error" });
                          }else
                          {
                            return res.json({
                              data: "Plot Updated Successfully",
                              code: 200,
                            });
                          }
                        });
                    }
                }
            }
        });
    });

    app.post("/projectChangeStatement", (req, res) => {
        const pid=req.body.pid;
        connection.query("SELECT * FROM plots WHERE pid = ?",[pid],(err,result)=>{
            if(err)
            {
                console.error("Error executing INSERT query: ", err);
                return res.status(500).json({ error: "Internal server error" });
            }else
            {
                return res.json({
                    data: result,
                    code: 200,
                });
            }
        });
    });
};