const multer = require('multer');
const path = require('path');
const crypto = require('crypto');


module.exports = function (app, connection) {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/saleplot');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    });
    
    const upload = multer({ 
        storage,
        fileFilter: (req, file, cb) => {
            // Skip if no file is uploaded
            if (!file) {
                return cb(null, false);
            }
            cb(null, true);
        }
    });

    app.post("/plotbooking", upload.single('file'), async (req, res) => {
        try {
            // console.log('Request body:', req.body);
            // console.log('Uploaded file:', req.file);
            const {
                cid, cidJoint, saleType, bid, pid, plotData, 
                totalSquareFeet, totalAmount, pricepersp, bokkingAmt,
                remainAmt, paymentMode, referedName, date,
                transaction, datedefauld
            } = req.body;
            let status = 0;
            const file = req.file;
            // return
            // Generate unique booking ID
            const generateUniqueID = () => {
                const timestamp = Date.now().toString(36).slice(-6);
                const randomString = crypto.randomBytes(2).toString('hex').slice(0, 4);
                return `${timestamp}${randomString}`.toUpperCase();
            };
            
            const BookingID = generateUniqueID();
            // Start transaction
            connection.beginTransaction(err => {
                if (err) {
                    console.error("Transaction error:", err);
                    return res.status(500).json({ 
                        code: 500,
                        message: "Transaction error",
                        error: err.message 
                    });
                }
    
                // 1. First insert into plotsale
                connection.query(
                    "INSERT INTO `plotsale`(`cid`,`pid`,`totalsf`,`totalamt`,`pricesf`,`date`,`regdate`,`dateup`,`status`,`bid`,`type`,`jointcid`,`referedName`,`BookingID`,`booking`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    [
                        cid,
                        pid,
                        totalSquareFeet,
                        totalAmount,
                        pricepersp,
                        datedefauld,
                        date,
                        date,
                        status,
                        bid,
                        saleType,
                        cidJoint,
                        referedName,
                        BookingID,
                        'Booked'
                    ],
                    (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                console.error("Error inserting into plotsale:", err);
                                res.status(500).json({ 
                                    code: 500,
                                    message: "Database error - plotsale",
                                    error: err.message 
                                });
                            });
                        }
    
                        const plotsaleId = result.insertId;
    
                        try {
                            // Parse plotData
                            const plots = JSON.parse(plotData);
    
                            // 2. Insert into saleplotdetails
                            const plotValues = plots.map(plot => [
                                plotsaleId,
                                plot.id,
                                parseFloat(plot.area) * parseFloat(pricepersp),
                                'Active',
                                0,
                                0,
                                plot.area,
                                BookingID,
                                pricepersp,
                            ]);
    
                            connection.query(
                                "INSERT INTO `saleplotdetails`(`sid`, `plotid`, `plotamt`, `status`, `oldplotid`, `oldPlotAmt`, `area`,`BookingID`,`rate`) VALUES ?",
                                [plotValues],
                                (err, result) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            console.error("Error inserting into saleplotdetails:", err);
                                            res.status(500).json({ 
                                                code: 500,
                                                message: "Database error - saleplotdetails",
                                                error: err.message 
                                            });
                                        });
                                    }


                                    const plotIds = plots.map(plot => plot.id);
                                        connection.query(
                                            "UPDATE `plots` SET `res` = 1 WHERE `id` IN (?)",
                                            [plotIds],
                                            (err, result) => {
                                            if (err) {
                                                return connection.rollback(() => {
                                                    console.error("Error updating plots:", err);
                                                    res.status(500).json({ 
                                                        code: 500,
                                                        message: "Database error - updating plots",
                                                        error: err.message 
                                                    });
                                                });
                                            }
    
                                            // 4. Insert into payment
                                            const paymentValues = [
                                                plotsaleId,
                                                parseFloat(totalAmount),
                                                parseFloat(bokkingAmt),
                                                paymentMode,
                                                transaction,
                                                file ? file.filename : "",
                                                date,
                                                date,
                                                'Paid', // or whatever initial status
                                                BookingID,
                                                'Credit'
                                            ];
    
                                            connection.query(
                                                "INSERT INTO `payment`(`sid`, `totalamt`, `paid`, `pmode`, `chequeNumber`, `chequesImage`, `date`, `dateup`, `status`,`BookingID`,`payType`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)",
                                                paymentValues,
                                                (err, result) => {
                                                if (err) {
                                                    return connection.rollback(() => {
                                                        console.error("Error inserting into payment:", err);
                                                        res.status(500).json({ 
                                                            code: 500,
                                                            message: "Database error - payment",
                                                            error: err.message 
                                                        });
                                                    });
                                                }
    
                                                connection.commit(err => {
                                                    if (err) {
                                                        return connection.rollback(() => {
                                                            console.error("Commit error:", err);
                                                            res.status(500).json({ 
                                                                code: 500,
                                                                message: "Commit error",
                                                                error: err.message 
                                                            });
                                                        });
                                                    }

                                                    return res.status(200).json({
                                                        code: 200,
                                                        message: "Booking successful",
                                                        BookingID: BookingID,
                                                        plotsaleId: plotsaleId,
                                                        plotDetailsCount: plots.length,
                                                        plotsUpdated: plotIds.length,
                                                        paymentReceived: parseFloat(bokkingAmt),
                                                        fileReceived: !!file
                                                    });
                                                });
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    } catch (parseError) {
                        connection.rollback(() => {
                            console.error("Error parsing plotData:", parseError);
                            res.status(400).json({ 
                                code: 400,
                                message: "Invalid plotData format",
                                error: parseError.message 
                            });
                        });
                    }
                }
            );
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ 
            code: 500, 
            message: "Server error",
            error: error.message 
        });
    }
});

    app.post('/getBookingDetails', (req, res) => 
    {
        console.log(req.body);
        const { startDate, endDate } = req.body;

        // const query = `
        // SELECT p.*, 
        //     c.fullname,
        //     pr.pname,
        //     p.totalamt,
        //     IFNULL(SUM(pay.paid) - SUM(pay.debit), 0) AS paidAmt, 
        //     (p.totalamt - IFNULL(SUM(pay.paid) - SUM(pay.debit), 0)) AS outstanding,
        //     DATE_FORMAT(p.regdate, '%Y-%m-%d') AS regdate FROM plotsale p
        //     LEFT JOIN customer c ON p.cid = c.cid
        //     LEFT JOIN project pr ON p.pid = pr.pid
        //     LEFT JOIN payment pay ON pay.BookingID = p.BookingID
        //     WHERE p.regdate BETWEEN ? AND ?
        //     GROUP BY p.id
        //     ORDER BY p.regdate ASC`;

        const query = `
            SELECT 
                ps.*,
                c.fullname,
                pr.pname,
                IFNULL(s.totalamt, 0)      AS totalamt,
                IFNULL(p.ppaid, 0)         AS ppaid,
                IFNULL(p.pdebit, 0)        AS pdebit,
                IFNULL(p.ppaid - p.pdebit, 0) AS paidAmt,
                (IFNULL(s.totalamt, 0) - IFNULL(p.ppaid - p.pdebit, 0)) AS outstanding,
                DATE_FORMAT(ps.regdate, '%Y-%m-%d') AS regdate
            FROM plotsale AS ps
            LEFT JOIN (
                SELECT BookingID, sid, SUM(plotamt) AS totalamt
                FROM saleplotdetails
                GROUP BY BookingID, sid
            ) AS s ON ps.BookingID = s.BookingID AND ps.id = s.sid
            LEFT JOIN (
                SELECT BookingID, sid, SUM(paid) AS ppaid, SUM(debit) AS pdebit
                FROM payment
                GROUP BY BookingID, sid
            ) AS p ON ps.BookingID = p.BookingID AND ps.id = p.sid
            LEFT JOIN customer AS c ON ps.cid = c.cid
            LEFT JOIN project AS pr ON ps.pid = pr.pid
            WHERE ps.regdate BETWEEN ? AND ?
            GROUP BY ps.id 
            ORDER BY ps.regdate ASC`;

        connection.query(query, [startDate, endDate], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Database error' });
            } else {
                res.json(results);
            }
        });
    });

    // SELECT p.*, 
    //         c.fullname,
    //         pr.pname,
    //         p.totalamt,
    //         p.IFNULL(SUM(pay.paid) - SUM(pay.debit), 0) AS paidAmt, 
    //         (p.totalamt - IFNULL(SUM(pay.paid) - SUM(pay.debit), 0)) AS outstanding,
    //         DATE_FORMAT(p.regdate, '%Y-%m-%d') AS regdate FROM plotsale p
    //         LEFT JOIN customer c ON p.cid = c.cid
    //         LEFT JOIN project pr ON p.pid = pr.pid
    //         LEFT JOIN payment pay ON pay.BookingID = p.BookingID
    //         WHERE p.regdate BETWEEN ? AND ?
    //         GROUP BY p.id
    //         ORDER BY p.regdate ASC
    app.post('/getBookingDetailsIndividual', (req, res) => 
    {
        // console.log(req.body);
        const { sid } = req.body;

        // const query = `
        //     SELECT p.*, c.fullname, pr.pname, p.totalamt, 
        //     IFNULL(SUM(pay.paid) - SUM(pay.debit), 0) AS paid, 
        //     (p.totalamt - IFNULL(SUM(pay.paid) - SUM(pay.debit), 0)) AS outstanding, DATE_FORMAT(p.regdate, '%Y-%m-%d') AS regdate FROM plotsale p
        //     LEFT JOIN customer c ON p.cid = c.cid
        //     LEFT JOIN project pr ON p.pid = pr.pid
        //     LEFT JOIN payment pay ON pay.BookingID = p.BookingID
        //     WHERE p.id = ?
        // `;
        const query = `
            SELECT 
                ps.*,
                c.fullname,
                pr.pname,
                IFNULL(s.totalamt, 0)      AS totalamt,
                IFNULL(p.ppaid, 0)         AS ppaid,
                IFNULL(p.pdebit, 0)        AS pdebit,
                IFNULL(p.ppaid - p.pdebit, 0) AS paid,
                (IFNULL(s.totalamt, 0) - IFNULL(p.ppaid - p.pdebit, 0)) AS outstanding,
                DATE_FORMAT(ps.regdate, '%Y-%m-%d') AS regdate
            FROM plotsale AS ps
            LEFT JOIN (
                SELECT BookingID, sid, SUM(plotamt) AS totalamt
                FROM saleplotdetails
                GROUP BY BookingID, sid
            ) AS s ON ps.BookingID = s.BookingID AND ps.id = s.sid
            LEFT JOIN (
                SELECT BookingID, sid, SUM(paid) AS ppaid, SUM(debit) AS pdebit
                FROM payment
                GROUP BY BookingID, sid
            ) AS p ON ps.BookingID = p.BookingID AND ps.id = p.sid
            LEFT JOIN customer AS c ON ps.cid = c.cid
            LEFT JOIN project AS pr ON ps.pid = pr.pid
            WHERE ps.id = ?;
            `;


        connection.query(query, [sid], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Database error' });
            } else {
                // console.log(results);
                res.json(results);
            }
        });
    });

    app.post("/plotPaymentBook", upload.single('file'), async (req, res) => {
        console.log(req.body);
        console.log(req.file);
        const {sid,regdate,defauldDate,bookingID,totalAmount,currentAmount,paymentType,paymentMode,transaction}=req.body;
        const file=req.file;
        let status=0;
        let credit=0;
        let debit=0;
        if(paymentType=='Credit')
        {
             credit=currentAmount;
             debit=0;
        }else
        {
             credit=0;
             debit=currentAmount;
        }

        connection.query("INSERT INTO `payment`(`sid`,`totalamt`,`paid`,`debit`,`pmode`,`cheque`, `chequeNumber`, `chequesImage`, `date`, `dateup`, `status`, `BookingID`, `purpose`, `payType`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
                sid,
                totalAmount,
                credit,
                debit,
                paymentMode,
                "",
                transaction,
                file ? file.filename : "",
                regdate,
                defauldDate,
                status,
                bookingID,
                "",
                paymentType
            ],(err,result)=>{
                if(err)
                {
                    console.error(err);
                    res.status(500).json({ error: 'Database error' });
                }else
                {
                    return res.json({ 
                        code: 200, 
                        message: 'Payment Successfull',
                    });
                }
            })
    })

    app.post("/plotPaymentBookEdit", upload.single('file'), async (req, res) => {
        console.log(req.body);
        console.log(req.file);
        const {sid,regdate,defauldDate,bookingID,totalAmount,currentAmount,paymentType,paymentMode,transaction,paymentEditID}=req.body;
        const file=req.file;
        let status=0;
        let credit=0;
        let debit=0;
        if(paymentType=='Credit')
        {
             credit=currentAmount;
             debit=0;
        }else
        {
             credit=0;
             debit=currentAmount;
        }
        let query="UPDATE `payment` SET `paid`= ? , `debit`=?, `pmode`=?,`chequeNumber`=?,`date`=?,`dateup`=?,`payType`=?";
        let queryParams=[
            credit,
            debit,
            paymentMode,
            transaction,
            regdate,
            defauldDate,
            paymentType,
        ]

         if (file) {
            query += ", `chequesImage`=?";
            queryParams.push(file.filename);
        }

        query += " WHERE `id`=?";
        queryParams.push(paymentEditID);

         connection.query(query, queryParams, (err, result) => {
            if (err) {
            console.error("Error executing UPDATE query: ", err);
            return res.status(500).json({ error: "Internal server error" });
            } else {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "payment not found" });
            }
            console.log("Payment updated successfully:", result);
            return res.json({ 
                code: 200, 
                message: 'Payment Updated Successfull',
            });
            }
        });
    })

    app.post('/uploadDocuments', upload.fields([
        { name: 'agreement', maxCount: 1 },
        { name: 'saledeed', maxCount: 1 },
        { name: 'form1', maxCount: 1 },
        { name: 'form2', maxCount: 1 },
        { name: 'ehasti', maxCount: 1 },
        { name: 'eswatu', maxCount: 1 },
    ]), async (req, res) => {
        try {
            const { sid } = req.body; // Get sale ID from form data
            // console.log(sid);
            
            // Check if sale ID exists
            if (!sid) {
                return res.status(400).json({ code: 400, message: 'Sale ID is required' });
            }
    
            // Prepare the update query dynamically based on which files were uploaded
            let updateFields = [];
            let values = [];
            
            if (req.files['agreement']) {
                updateFields.push('agreement = ?');
                values.push(req.files['agreement'][0].path);
            }
            if (req.files['saledeed']) {
                updateFields.push('saledeed = ?');
                values.push(req.files['saledeed'][0].path);
            }
            if (req.files['form1']) {
                updateFields.push('form1 = ?');
                values.push(req.files['form1'][0].path);
            }
            if (req.files['form2']) {
                updateFields.push('form2 = ?');
                values.push(req.files['form2'][0].path);
            }
            if (req.files['ehasti']) {
                updateFields.push('ehasti = ?');
                values.push(req.files['ehasti'][0].path);
            }
            if (req.files['eswatu']) {
                updateFields.push('eswatu = ?');
                values.push(req.files['eswatu'][0].path);
            }
    
            // Check if at least one file was uploaded
            if (updateFields.length === 0) {
                return res.status(400).json({ code: 400, message: 'No files were uploaded' });
            }
    
            // Add sid to values array for WHERE clause
            values.push(sid);
    
            // Build the update query
            const query = `UPDATE plotsale SET ${updateFields.join(', ')} WHERE id = ?`;
            
            connection.query(query, values, (error, results) => {
                if (error) {
                    console.error('Database error:', error);
                    return res.status(500).json({ code: 500, message: 'Database error' });
                }
                
                if (results.affectedRows === 0) {
                    return res.status(404).json({ code: 404, message: 'Sale record not found' });
                }
                
                res.json({ 
                    code: 200, 
                    message: 'Files updated successfully',
                    data: {
                        id: sid,
                        updatedFields: updateFields.map(field => field.split(' ')[0])
                    }
                });
            });
        } catch (error) {
            console.error('Server error:', error);
            res.status(500).json({ code: 500, message: 'Server error' });
        }
    });

    app.post("/PlotShiftDetailsChange", upload.none(), async (req, res) => {
            const today = new Date().toISOString().split("T")[0]; 
            console.log("Request Body:", req.body);

            const {
                sid,
                newRate,          // New rate amount
                Newtotalamt,      // New total amount
                changedplotid,    // New plot ID
                date,
                oldPlotnum,
                pid,
                OldoverallTotal,  // Complete total amount
                areanew,          // New area
                saleplotdetailsid,// Table ID
                oldPlotid,        // Old plot ID
                oldplotamt        // Old plot amount
            } = req.body;

            // 1. Update saleplotdetails
            const updateSalePlotSql = `
                UPDATE saleplotdetails 
                SET plotid = ?, plotamt = ?, status = ?, oldplotid = ?, oldPlotAmt = ?, area = ?, rate = ?
                WHERE id = ?
            `;

            connection.query(
                updateSalePlotSql,
                [changedplotid, Newtotalamt, 'Shifted', oldPlotid, oldplotamt, areanew, newRate, saleplotdetailsid],
                (err, result1) => {
                    if (err) {
                        console.error('Database error (saleplotdetails):', err);
                        return res.status(500).json({ code: 500, message: 'Database error while updating saleplotdetails' });
                    }

                    // 2. Mark old plot as available
                    const updateOldPlotSql = "UPDATE plots SET res = 0 WHERE id = ?";
                    connection.query(updateOldPlotSql, [oldPlotid], (err1, result2) => {
                        if (err1) {
                            console.error('Database error (old plot):', err1);
                            return res.status(500).json({ code: 500, message: 'Database error while updating old plot' });
                        }

                        // 3. Mark new plot as reserved
                        const updateNewPlotSql = "UPDATE plots SET res = 1 WHERE id = ?";
                        connection.query(updateNewPlotSql, [changedplotid], (err2, result3) => {
                            if (err2) {
                                console.error('Database error (new plot):', err2);
                                return res.status(500).json({ code: 500, message: 'Database error while updating new plot' });
                            }

                            // SUCCESS
                            res.json({ code: 200, success: true, message: "Plot shifted successfully" });
                        });
                    });
                }
            );
        });

            //UPDATE `saleplotdetails` SET `id`='[value-1]',`sid`='[value-2]',`plotid`='[value-3]',`plotamt`='[value-4]',`status`='[value-5]',`oldplotid`='[value-6]',`oldPlotAmt`='[value-7]',`area`='[value-8]',`BookingID`='[value-9]',`rate`='[value-10]' WHERE 1

            // // Step 1: Update old data in saleplotdetails
            // const q1 = "UPDATE `saleplotdetails` SET `oldplotid` = `plotid`, `oldPlotAmt` = `plotamt` WHERE `sid` = ? AND `plotid` = ?";
            // connection.query(q1, [sid, oldPlotnum], (err, result1) => {
            // if (err) return rollback(err);

            // // Step 2: Update new plot id and amount
            // const q2 = "UPDATE `saleplotdetails` SET `plotid` = ?, `plotamt` = ?, `status` = 'Shifted',`area`=? WHERE `sid` = ? AND `plotid` = ?";
            // connection.query(q2, [changedplotid, Newtotalamt,areanew, sid, oldPlotnum], (err, result2) => {
            //     if (err) return rollback(err);

            //     // Step 3: Update plotsale table
            //     const q3 = "UPDATE `plotsale` SET `totalamt` = ?, `pricesf` = ?, `date` = ?, `shiftAmt` = ? WHERE `id` = ?";
            //     connection.query(q3, [Newtotalamt, newRate, today,OldoverallTotal, sid], (err, result3) => {
            //         if (err) return rollback(err);

            //         // Step 4: Mark old plot as available
            //         const q4 = "UPDATE `plots` SET `res` = 0 WHERE `plotnum` = ? AND `pid` = ?";
            //         connection.query(q4, [oldPlotnum, pid], (err, result4) => {
            //             if (err) return rollback(err);

            //             // Step 5: Mark new plot as reserved
            //             const q5 = "UPDATE `plots` SET `res` = 1 WHERE `plotnum` = ? AND `pid` = ?";
            //             connection.query(q5, [changedplotid, pid], (err, result5) => {
            //                 if (err) return rollback(err);

            //                 // All successful, commit
            //                 connection.commit((err) => {
            //                     if (err) return rollback(err);

            //                     res.json({ code:200, success: true, message: "Plot shifted successfully" });
            //                 });
            //             });
            //         });
            //     });
            // });
        // });

        // function rollback(error) {
        //     connection.rollback(() => {
        //         console.error(error);
        //         res.status(500).json({ success: false, message: "Error in shifting plot" });
        //     });
        // }
    // });

    // getTransactionEntries
    app.post("/getTransactionEntries", upload.none(), async (req, res) => 
    {
        // console.log(req.body);
        const {startDate,endDate}=req.body;

        connection.query(`SELECT 
                            a.addype, 
                            a.paytype, 
                            a.purpose, 
                            a.paymentType, 
                            a.date, 
                            a.transaction,
                            a.description,
                            a.bid,
                            c.category,
                            p.serveNumber,
                            p.qty,
                            p.rate,
                            p.Amount,
                            CASE
                                WHEN p.cid IS NULL AND p.lid IS NULL AND p.partyName IS NOT NULL THEN p.partyName
                                WHEN p.cid IS NOT NULL THEN cust.fullname
                                WHEN p.lid IS NOT NULL THEN l.name
                                ELSE NULL
                            END AS display_name,
                            proj.pname AS project_name
                            FROM 
                                allpayment AS a
                            INNER JOIN 
                                paymenttransaction AS p ON a.id = p.tranid
                            INNER JOIN 
                                category AS c ON a.catid = c.id
                            LEFT JOIN 
                                customer AS cust ON p.cid = cust.cid
                            LEFT JOIN 
                                landowner AS l ON p.lid = l.id
                            LEFT JOIN 
                                project AS proj ON p.pid = proj.pid
                            WHERE
                                a.date BETWEEN ? AND ?
                            ORDER BY a.date ASC;
                            `,[startDate,endDate],(err,row)=>
                        {
                            if(err)
                            {
                                console.log(err)
                                return res.status(500).json({error:"Internal Server Error"});
                            }else
                            {
                                return res.json(
                                {
                                        data:row,
                                        message:'Transaction Row',
                                        code:200,
                                })
                            }
                        }
                    );
    });


     // getTransactionEntries
    app.post("/getsalePaymentTransactions", upload.none(), async (req, res) => 
    {
        const {startDate,endDate}=req.body;

        const query=`SELECT 
                            pay.*,
                            ps.cid,
                            ps.pid,
                            IFNULL(spd.totalamt, 0) AS totalamt,
                            c.fullname,
                            pr.pname,
                            spd.plots
                        FROM payment AS pay
                        JOIN plotsale AS ps ON pay.sid = ps.id
                        JOIN customer AS c ON ps.cid = c.cid
                        JOIN project AS pr ON ps.pid = pr.pid
                        LEFT JOIN (
                            SELECT 
                                spd.sid, 
                                SUM(spd.plotamt) AS totalamt,
                                GROUP_CONCAT(p.plotnum ORDER BY p.plotnum) AS plots
                            FROM saleplotdetails spd
                            JOIN plots p ON spd.plotid = p.id
                            GROUP BY spd.sid
                        ) AS spd ON spd.sid = ps.id
                        WHERE pay.date BETWEEN ? AND ?
                        ORDER BY pay.date ASC;
                        `;
        connection.query(query,[startDate, endDate],(err,row)=>{
            if(err)
            {
                console.log(err)
                return res.status(500).json({error:"Internal Server Error"});
            }else
            {
                 return res.json(
                {
                        data:row,
                        message:'Transaction Row',
                        code:200,
                })
            }
        })
    })


    app.post("/deletePaymentTransaction",upload.none(), (req, res) => {
        const { id } = req.body;
        console.log(id);
        if (!id) {
            return res.status(400).json({ success: false, message: "Missing ID" });
        }

        const sql = "DELETE FROM payment WHERE id = ?";
        connection.query(sql, [id], (err, result) => 
        {
            if (err) {
            console.error("Delete Error:", err);
                 res.status(500).json({ success: false, message: "Server error" });
            }
            else{
                 return res.json(
                {
                        data:[],
                        message:'Deleted',
                        code:200,
                })
            }
        });
    });


    app.post("/bookingCancelation",upload.none(), (req, res) => {
        const { sid, bookingid } = req.body;
        if (!sid) {
            return res.status(400).json({ success: false, message: "Missing ID" });
        }
        const deleteSql = "DELETE FROM payment WHERE sid = ? AND BookingID = ?";
        connection.query(deleteSql, [sid, bookingid], (err, deleteResult) => {
            if(err)
            {
                res.status(500).json({ success:false,message:"Server Error"});
            }else
            {
                
                console.log("Payment record deleted successfully");

                const selectSql = "SELECT plotid FROM saleplotdetails WHERE sid = ? AND BookingID = ?";
                connection.query(selectSql,[sid,bookingid],(err,selectResult)=>{
                    if(err)
                    {
                        console.error("Select Error:", err)
                        return res.status(500).json({success:false,message:"Server Error During Plot Selection"});
                    }

                    // const plotid=selectResult[0].plotid;
                    // console.log("PlotID:",plotid);

                    const plotIds = selectResult.map(row => row.plotid);
                    console.log("PlotIDs:", plotIds);

                    const updateSql = `UPDATE plots SET res = 0 WHERE id IN (?)`;
                    connection.query(updateSql,[plotIds],(err,updateResult)=>{
                        if(err)
                        {
                            console.error("update Error:",err)
                            return res.status(500).json({success:false,message:"Server error During plot updates"})
                        }
                        console.log("Plot Updated Successfully");

                        const deleteSalePlotSql = "DELETE FROM saleplotdetails WHERE sid = ? AND BookingID = ?";
                        connection.query(deleteSalePlotSql, [sid, bookingid], (err, deleteSaleResult) => {
                            if (err) {
                                console.error("Sale Plot Delete Error:", err);
                                return res.status(500).json({ success: false, message: "Server error during sale plot deletion" });
                            }
                            
                            console.log("Sale plot record deleted successfully");
                            const deletePlotSaleSql = "DELETE FROM plotsale WHERE id = ? AND BookingID = ?";
                            connection.query(deletePlotSaleSql, [sid, bookingid], (err, deletePlotSaleResult) => 
                            {
                                if (err) {
                                    console.error("Plot Sale Delete Error:", err);
                                    return res.status(500).json({ success: false, message: "Server error during plotsale deletion" });
                                }

                                if (deletePlotSaleResult.affectedRows === 0) {
                                    return res.status(404).json({ success: false, message: "No matching plotsale record found to delete" });
                                }

                                console.log("Plot sale record deleted successfully");

                                // Final Response
                                return res.json({
                                    data: [],
                                    message: "Booking cancellation completed successfully",
                                    code: 200
                                });
                            });
                        })
                    })
                    
                })
            }
        });
    });
}