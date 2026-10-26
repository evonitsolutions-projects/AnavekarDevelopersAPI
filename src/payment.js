const multer = require('multer');
const path = require('path');
module.exports = function (app, connection) {

    const upload = multer();
    app.post("/advancePaid", (req, res) => {
        const bid = parseInt(req.body.bid);
        let query = '';
        if (bid === 0 || !bid) {
            query = `SELECT 
                        customer.fullname, 
                        plotsale.*, 
                        project.pname,
                        COALESCE(SUM(CASE WHEN allpayment.paytype = 'Credit' THEN paymenttransaction.Amount END), 0) AS credit_Amount,
                        COALESCE(SUM(CASE WHEN allpayment.paytype = 'Debit' THEN paymenttransaction.Amount END), 0) AS debit_Amount
                    FROM 
                        plotsale
                    JOIN 
                        customer ON plotsale.cid = customer.cid
                    JOIN 
                        project ON plotsale.pid = project.pid
                    LEFT JOIN 
                        paymenttransaction ON paymenttransaction.sid = plotsale.id
                    LEFT JOIN 
                        allpayment ON allpayment.id = paymenttransaction.tranid
                    GROUP BY 
                        plotsale.id
                    `;
        } else {
            query = `SELECT 
                        customer.fullname, 
                        plotsale.*, 
                        project.pname,
                        COALESCE(SUM(CASE WHEN allpayment.paytype = 'Credit' THEN paymenttransaction.Amount END), 0) AS credit_Amount,
                        COALESCE(SUM(CASE WHEN allpayment.paytype = 'Debit' THEN paymenttransaction.Amount END), 0) AS debit_Amount
                    FROM 
                        plotsale
                    JOIN 
                        customer ON plotsale.cid = customer.cid
                    JOIN 
                        project ON plotsale.pid = project.pid
                    LEFT JOIN 
                        paymenttransaction ON paymenttransaction.sid = plotsale.id
                    LEFT JOIN 
                        allpayment ON allpayment.id = paymenttransaction.tranid
                    GROUP BY 
                        plotsale.id
                    `;
        }
        connection.query(query, [bid], (err, rows) => {
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
                    return res.json({
                        data: "Plots Not Found",
                        code: 201,
                    });
                }
            }
        });
    });

    app.post("/PaidDetails", (req, res) => {
        const bid = parseInt(req.body.bid);
        let query = '';
        if (bid === 0 || !bid) {
            query = `SELECT 
                        customer.fullname, 
                        plotsale.*, 
                        project.pname,
                        COALESCE(SUM(CASE WHEN allpayment.paytype = 'Credit' THEN paymenttransaction.Amount END), 0) AS credit_Amount,
                        COALESCE(SUM(CASE WHEN allpayment.paytype = 'Debit' THEN paymenttransaction.Amount END), 0) AS debit_Amount,
                        COUNT(DISTINCT saleplotdetails.id) AS noofplots,
                        CASE 
                            WHEN plotsale.type = 1 THEN joint_customer.fullname
                            ELSE NULL
                        END AS joint_name
                    FROM 
                        plotsale
                    JOIN 
                        customer ON plotsale.cid = customer.cid
                    JOIN 
                        project ON plotsale.pid = project.pid
                    JOIN 
                        saleplotdetails ON saleplotdetails.sid = plotsale.id
                    LEFT JOIN 
                        paymenttransaction ON paymenttransaction.sid = plotsale.id
                    LEFT JOIN 
                        allpayment ON allpayment.id = paymenttransaction.tranid
                    LEFT JOIN 
                        customer AS joint_customer ON plotsale.jointcid = joint_customer.cid AND plotsale.type = 1
                    GROUP BY 
                        plotsale.id;
                    `;
            // query=`SELECT 
            //             plotsale.*, 
            //             SUM(transaction.Amount) AS sumofpaid, 
            //             project.pname,
            //             customer.fullname, 
            //             COUNT(DISTINCT saleplotdetails.id) AS noofplots,
            //             CASE 
            //                 WHEN plotsale.type = 1 THEN joint_customer.fullname
            //                 ELSE NULL
            //             END AS joint_name
            //         FROM 
            //             plotsale 
            //         JOIN 
            //             transaction ON plotsale.id = transaction.sid 
            //         JOIN 
            //             project ON plotsale.pid = project.pid 
            //         JOIN 
            //             customer ON plotsale.cid = customer.cid 
            //         LEFT JOIN 
            //             saleplotdetails ON saleplotdetails.sid = plotsale.id 
            //         LEFT JOIN 
            //             customer AS joint_customer ON plotsale.jointcid = joint_customer.cid AND plotsale.type = 1
            //         GROUP BY 
            //             plotsale.id;
            //         `;
        } else {
            query = `SELECT 
                        customer.fullname, 
                        plotsale.*, 
                        project.pname,
                        COALESCE(SUM(CASE WHEN allpayment.paytype = 'Credit' THEN paymenttransaction.Amount END), 0) AS credit_Amount,
                        COALESCE(SUM(CASE WHEN allpayment.paytype = 'Debit' THEN paymenttransaction.Amount END), 0) AS debit_Amount,
                        COUNT(DISTINCT saleplotdetails.id) AS noofplots,
                        CASE 
                            WHEN plotsale.type = 1 THEN joint_customer.fullname
                            ELSE NULL
                        END AS joint_name
                    FROM 
                        plotsale
                    JOIN 
                        customer ON plotsale.cid = customer.cid
                    JOIN 
                        project ON plotsale.pid = project.pid
                    JOIN 
                        saleplotdetails ON saleplotdetails.sid = plotsale.id
                    LEFT JOIN 
                        paymenttransaction ON paymenttransaction.sid = plotsale.id
                    LEFT JOIN 
                        allpayment ON allpayment.id = paymenttransaction.tranid
                    LEFT JOIN 
                        customer AS joint_customer ON plotsale.jointcid = joint_customer.cid AND plotsale.type = 1
                    GROUP BY 
                        plotsale.id;
                `;
        }
        connection.query(query, [bid], (err, rows) => {
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
                    return res.json({
                        data: "Plots Not Found",
                        code: 201,
                    });
                }
            }
        });
    });

    app.post("/saleDetails", (req, res) => {
        const sid = parseInt(req.body.sid);
        let query = '';
        query = `SELECT 
                    plotsale.*,
                    COALESCE(SUM(CASE WHEN allpayment.paytype = 'Credit' THEN paymenttransaction.Amount END), 0) AS credit_Amount,
                    COALESCE(SUM(CASE WHEN allpayment.paytype = 'Debit' THEN paymenttransaction.Amount END), 0) AS debit_Amount,
                    project.pname,
                    customer.fullname, 
                    COUNT(DISTINCT saleplotdetails.id) AS noofplots 
                FROM 
                    plotsale 
                JOIN 
                    project ON plotsale.pid = project.pid 
                JOIN 
                    customer ON plotsale.cid = customer.cid 
                JOIN 
                    saleplotdetails ON saleplotdetails.sid = plotsale.id 
                LEFT JOIN 
                    paymenttransaction ON paymenttransaction.sid = plotsale.id
                LEFT JOIN 
                    allpayment ON allpayment.id = paymenttransaction.tranid
                WHERE 
                    plotsale.id = ?
                GROUP BY 
                    plotsale.id;`
        connection.query(query, [sid], (err, rows) => {
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
                    return res.json({
                        data: "Plots Not Found",
                        code: 201,
                    });
                }
            }
        });
    });

    app.post("/advancePaymentHistory", (req, res) => {
        // console.log(req.body);
        const sid = req.body.billno;
        // connection.query(`SELECT 
        //                     paymenttransaction.*,
        //                     allpayment.purpose,
        //                     allpayment.paymentType,
        //                     allpayment.transaction,
        //                     allpayment.paytype,
        //                     allpayment.date
        //                 FROM 
        //                     paymenttransaction
        //                 JOIN
        //                     allpayment ON allpayment.id = paymenttransaction.tranid
        //                 WHERE
        //                     paymenttransaction.sid=?`,[sid],(err,rows)=>{
        connection.query('SELECT * FROM `payment` WHERE `sid`=?', [sid], (err, rows) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                return res.json({
                    data: rows,
                    code: 200,
                });
            }
        })
    });

    // app.post('/payEMI', upload.none(),(req, res) => {
    //     console.log(req.body);
    //     const sid=parseInt(req.body.sid);
    //     const totalamt=parseFloat(req.body.totalamt); //total
    //     const remain=parseFloat(req.body.remain); // remain old
    //     const payEMI=parseFloat(req.body.paying); //emi
    //     const pending=parseFloat(req.body.pending); //last pending
    //     const paymentmode=req.body.pmode;
    //     const date=req.body.date;
    //     const cheque=req.body.cheque;
    //     const trans=req.body.trans;
    //     let detail='';
    //     if(cheque=='')
    //     {
    //        detail=trans; 
    //     }

    //     connection.query("INSERT INTO `payment`(`sid`,`totalamt`,`remain`,`paid`,`pmode`,`cheque`,`date`)VALUES(?,?,?,?,?,?,?)",
    //         [
    //             sid,
    //             totalamt,
    //             pending,
    //             payEMI,
    //             paymentmode,
    //             detail,
    //             date
    //         ],(err,rows)=>{
    //             if(err)
    //             {
    //                 console.log(err);
    //                 return res.status(500).json({ error: "Internal server error" });
    //             }else
    //             {
    //                 if(pending==0)
    //                 {
    //                     connection.query("UPDATE plotsale SET status=1 WHERE id=?",[sid],(err,rows)=>{
    //                         if(err)
    //                         {
    //                             console.log(err);
    //                             return res.status(500).json({ error: "Internal server error" });
    //                         }else
    //                         {
    //                             return res.json({
    //                                 data: rows,
    //                                 code: 201,
    //                             });
    //                         }
    //                     });
    //                 }else
    //                 {
    //                     return res.json({
    //                         data: rows,
    //                         code: 200,
    //                     });
    //                 }
    //             }
    //         });
    // });

    app.post("/saleplotsview", (req, res) => {
        // console.log(req.body);
        const sid = req.body.sid;
        let query = `SELECT saleplotdetails.plotamt,
                        saleplotdetails.plotid,
                        saleplotdetails.status AS plotstatus,
                        saleplotdetails.oldplotid,
                        saleplotdetails.oldplotAmt,
                        saleplotdetails.area,
                        saleplotdetails.rate,
                        saleplotdetails.id AS saleplotdetailsid,
                            plots.*
                    FROM saleplotdetails 
                    JOIN plots ON saleplotdetails.plotid = plots.id
                    WHERE saleplotdetails.sid=?`;
        connection.query(query, [sid], (err, rows) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                return res.json({
                    data: rows,
                    code: 200,
                });
            }
        })
    });

}

