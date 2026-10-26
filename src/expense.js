const path = require('path');
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf-parse');
const nodemailer = require('nodemailer');
const { type } = require('os');
const { error } = require('console');
const { pid } = require('process');
module.exports = function (app, connection) {
    const upload = multer();
    app.post("/uploadexpenseStatement", upload.single('statement'), async (req, res) => {
        const pdfData = req.file.buffer;
        const { uid } = req.body;

        pdf(pdfData)
            .then((data) => {
                const textContent = data.text;
                const transactions = extractTransactions(textContent, uid);
                res.json({
                    data: transactions,
                    code: 200,
                });
            })
            .catch((error) => {
                console.error("Error parsing PDF:", error);
                res.status(500).json({
                    error: 'Error parsing PDF',
                    code: 500
                });
            });
    });

    // function extractTransactions1(textContent, uid) {
    //     const transactions = [];
    //     const lines = textContent.split('\n');
    //     let inTransactionSection = false;
    //     let headers = [];

    //     lines.forEach((line) => {
    //       if (line.trim()!== '') {
    //         if (line.includes('Post Date') && line.includes('Value Date') && line.includes('Details') && line.includes('Chq no') && line.includes('Debit') && line.includes('Credit') && line.includes('Balance')) {
    //           inTransactionSection = true;
    //           headers = line.split(/\s{2,}/);
    //         } else if (inTransactionSection) {
    //           const columns = line.split(/\s{2,}/);
    //           console.log(columns);
    //           if (columns.length >= 7) {
    //             const transaction = {
    //               postDate: columns[0],
    //               valueDate: columns[1],
    //               description: columns[2],
    //               chqNo: columns[3],
    //               debit: columns[4],
    //               credit: columns[5],
    //               balance: columns[6],
    //             };
    //             transactions.push(transaction);
    //           }
    //         }
    //       }
    //     });

    //     if (transactions.length === 0) {
    //       throw new Error('Unable to extract transactions from PDF');
    //     }

    //     return transactions;
    // }

    function extractTransactions(textContent, uid) {
        // console.log(textContent);
        // const transactions = [];
        // const lines = textContent.split("\n");
        // const datePattern = /\b\d{2}\/\d{2}\/\d{2}\b/;
        // const datePattern2 = /^\d{2}-\d{2}-\d{4}/;
        // let i = 0;
        // lines.forEach((line, index) => {
        //   if (datePattern.test(line.substring(0, 8))) 
        //   {
        // console.log(
        //   `|${line.substring(0, 8)}|     |${line.substring(
        //     17,
        //     64
        //   )}|     |${line.substring(65, 73)}|     |${line.substring(
        //     76,
        //     91
        //   )}|     |${line.substring(95, 110)}|     |${line.substring(112, 131)}|`
        // );
        //   } else if (datePattern2.test(line.substring(0, 10))) 
        //   {
        //     if (line.substring(10, 33) != "https://finacle.ubi.com") 
        //     {
        //     //   console.log(
        //     //     `|${line.substring(0, 10)}|     |${line.substring(
        //     //       11,
        //     //       64
        //     //     )}|     |${line.substring(65, 73)}|     |${line.substring(
        //     //       76,
        //     //       91
        //     //     )}|     |${line.substring(95, 110)}|     |${line.substring(
        //     //       112,
        //     //       131
        //     //     )}|`
        //     //   );
        //       const transaction1 = {
        //         date: line.substring(0, 10).trim(),
        //         description: line.substring(11, 64).trim(),
        //         transaction: line.substring(65, 73).trim(),
        //         debit: line.substring(76, 91).trim(),
        //         credit: line.substring(95, 110).trim(),
        //         balance: line.substring(112, 131).trim(),
        // purposes:'',
        // reson:'',
        // update:'',
        // status:0,
        // uid:uid,
        // id:i+1
        //       };
        //       transactions.push(transaction1);
        //     }
        //   }
        //   i++;
        // });
        // return transactions;
        const transactions = [];
        const lines = textContent.split("\n");
        // const datePattern1 = /\b\d{2}\/\d{2}\/\d{2}\b/;
        const datePattern1 = /\d{2}\/\d{2}\/\d{2}/;
        const datePattern2 = /^\d{2}-\d{2}-\d{4}/;
        const forwordPattern = /^BROUGHTFORWARD$/;
        const forwordPattern2 = /^BroughtForword$/;
        const forwordPattern3 = /^Brought Forword$/;
        let i = 0;
        // console.log(lines);
        let broughtforwordPushed = false;
        for (i; i < lines.length; i++) {
            let bankname = lines[0];
            console.log(bankname);

            if (lines[i].trim() == "KARNATAKA VIKAS GRAMEENA BANK") {
                let bankname1 = lines[i].trim();
                // console.log(bankname1);
                lines.forEach((line, index) => {
                    if (datePattern1.test(line.substring(0, 8)) || forwordPattern.test(line.substring(0, 14)) || forwordPattern2.test(line.substring(0, 14)) || forwordPattern3.test(line.substring(0, 14))) {

                        const dateRegex = /\d{2}\/\d{2}\/\d{2}/g;
                        const dates = line.match(dateRegex);
                        const remainingPart = line.replace(dateRegex, "").trim();

                        // Regular expression to match the text (assuming text ends before numeric values)
                        const textRegex = /[a-zA-Z ]+/;
                        const textMatch = remainingPart.match(textRegex);
                        const text = textMatch ? textMatch[0].trim() : "";

                        // Extracting the remaining part after removing text
                        const amountsPart = remainingPart.replace(text, "").trim();

                        // Splitting the amounts
                        const amounts = amountsPart.match(/\d+\.\d+/g);

                        const patterns2 = [

                            /^\d{6}(?!\.\d{2})/g,

                        ];

                        const patterns = [
                            /^\d{6}\.\d{2}/g,
                            /^\d{1}\.\d{2}/g,
                            /^\d{2}\.\d{2}/g,
                            /^\d{3}\.\d{2}/g,
                            /^\d{4}\.\d{2}/g,
                            /^\d{5}\.\d{2}/g,
                            /^\d{7}\.\d{2}/g,
                            /^\d{8}\.\d{2}/g,
                        ];

                        // Extract the relevant part from the string by matching each pattern
                        let extractedPart = "";
                        let extractedPart2 = "";
                        let match1 = null;
                        let match2 = null;
                        let match3 = null;
                        let match5 = null;
                        if (text.trim() == 'CREDIT' || text.trim() == 'Credit' || text.trim() == 'By Transfer' || text.trim() == 'WDL TRANSFER' || text.trim() == 'DEP TFR') {

                        } else {
                            for (let pattern1 of patterns2) {

                                match1 = amountsPart.match(pattern1);
                                if (match1) {
                                    extractedPart = amountsPart.replace(pattern1, "").trim();
                                    break;
                                }
                            }
                        }


                        for (let pattern of patterns) {
                            match2 = match1
                                ? extractedPart.match(pattern)
                                : amountsPart.match(pattern);
                            if (match2) {
                                extractedPart2 = match1
                                    ? extractedPart.replace(pattern, "").trim()
                                    : amountsPart.replace(pattern, "").trim();
                                break;
                            }
                        }

                        for (let pattern of patterns) {
                            match3 = extractedPart2.match(pattern);
                            if (match3) {
                                break;
                            }
                        }

                        for (let pattern of patterns) {
                            match5 = line.substring(15).trim().match(pattern);
                            if (match5) {

                                break;
                            }
                        }
                        transactions.push({
                            bank: "KVG",
                            date: dates ? dates[0] : '',
                            description: text,
                            transaction: match1 ? match1[0] : '',
                            debit: match2 ? match2[0] : 0,
                            credit: match2 ? match2[0] : 0,
                            balance: match3 ? match3[0] : 0,
                            purposes: '',
                            reson: '',
                            update: '',
                            status: 0,
                            uid: uid,
                            id: i + 1,
                            broughtforword: broughtforwordPushed ? null : (match5 ? match5[0] : null),
                            trak: 0,
                            bankname: bankname1
                        });
                        if (!broughtforwordPushed) {
                            broughtforwordPushed = true;
                        }
                        // transactions.push({
                        //     bank: "KVG",
                        //     date: dates?dates[0]:'',
                        //     description: text,
                        //     cheque: match1 ? match1[0] : null,
                        //     debit: match2 ? match2[0] : null,
                        //     credit: match2 ? match2[0] : null,
                        //     balance: match3 ? match3[0] : null,
                        //     broughtforword : match5? match5[0]:null
                        // });
                    }
                });
                break;
            } else if (lines[i].trim() == "UNION BANK OF INDIA") {
                let bankname1 = lines[i].trim();
                console.log(bankname1);
                lines.forEach((line, index) => {
                    if (datePattern2.test(line.substring(0, 10))) {

                        if (
                            line.substring(10, 33) !== "https://finacle.ubi.com" &&
                            line.substring(10, 37) !== "https://powwebsrvlb.ubi.com"
                        ) {
                            i++;
                            // console.log(line)
                            transactions.push({
                                bank: "other",
                                date: line.substring(0, 10).trim(),
                                description: line.substring(11, 64).trim(),
                                transaction: line.substring(65, 73).trim(),
                                debit: line.substring(76, 91).trim(),
                                credit: line.substring(95, 110).trim(),
                                balance: line.substring(112, 131).trim(),
                                purposes: '',
                                reson: '',
                                update: '',
                                status: 0,
                                uid: uid,
                                id: i + 1,
                                trak: 0,
                                bankname: bankname1
                            });
                        }
                    }
                });
                break;
            }
        }
        //   console.log(transactions);
        return transactions;
    }


    app.post("/balancesheet", upload.none(), (req, res) => {
        // console.log(req.body);
        const bid = parseInt(req.body.bid);
        const fromdate = req.body.fromdate;
        const todate = req.body.todate;
        let query = '';
        // if (bid === 0 || !bid) {
        //     query = "SELECT * FROM `tempexpense` WHERE `dateup` BETWEEN ? AND ?";
        // } else {
        //     query = "SELECT * FROM `tempexpense` WHERE `dateup` BETWEEN ? AND ? AND `bid`=?";
        // }
        if (bid === 0 || !bid) {
            query = "SELECT te.*, c.category AS cat, c.type AS ctype FROM tempexpense te INNER JOIN category c ON te.catid = c.id WHERE te.dateup BETWEEN? AND?";
        } else {
            query = "SELECT te.*, c.category AS cat, c.type AS ctype FROM tempexpense te INNER JOIN category c ON te.catid = c.id WHERE te.dateup BETWEEN? AND? AND te.bid=?";
        }
        connection.query(query, [fromdate, todate, bid], (err, rows) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                // console.log(rows);
                return res.json({
                    data: rows,
                    code: 200,
                });
            }
        });
    });

    app.post("/transactionUpdate", upload.none(), (req, res) => {
        const {
            transid,
            purpose,
            partyName,
            date,
            dateup,
            description,
            transaction,
            debit,
            credit,
            balance,
            bid,
            uid,
            project,
            type1,
            category,
            remark,
        } = req.body;
        // const type="Project";
        // const category="";
        const formattedDate = formatDate(date);
        console.log(req.body);
        connection.query("INSERT INTO `tempexpense`(`date`,`dateup`,`description`,`amount`,`bid`,`pid`,`partyName`,`purpose`,`uid`,`remark`,`catid`)VALUES(?,?,?,?,?,?,?,?,?,?,?)", [
            formattedDate,
            dateup,
            description,
            debit,
            bid,
            project,
            partyName,
            purpose,
            uid,
            remark,
            category
        ], (err, result) => {
            if (err) {
                console.error("Error executing INSERT query: ", err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                console.log("Statement added successfully:", result);
                return res.json({
                    data: result,
                    code: 200,
                });
            }
        })
    });

    // manual add expense
    app.post("/addexpense", upload.none(), (req, res) => {
        const {
            uid,
            bid,
            dateup,
            type,
            category,
            pid,
            amount,
            partyname,
            purpose,
            remark
        } = req.body;
        // console.log(req.body);
        const formattedDate = formatDate(dateup);
        connection.query("INSERT INTO `tempexpense`(`date`,`dateup`,`amount`,`bid`,`pid`,`partyName`,`purpose`,`uid`,`remark`,`catid`)VALUES(?,?,?,?,?,?,?,?,?,?)", [
            formattedDate,
            dateup,
            amount,
            bid,
            pid,
            partyname,
            purpose,
            uid,
            remark,
            category
        ], (err, result) => {
            if (err) {
                console.error("Error executing INSERT query: ", err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                console.log("Statement added successfully:", result);
                return res.json({
                    data: result,
                    code: 200,
                });
            }
        })
    });

    app.post("/updateexpense", upload.none(), (req, res) => {
        const {
            uid,
            bid,
            dateup,
            pid,
            type,
            category,
            amount,
            partyname,
            purpose,
            exid,
            remark
        } = req.body;
        console.log(req.body);
        const formattedDate = formatDate(dateup);
        let query = "UPDATE `tempexpense` SET `dateup`=?,`amount`=?,`purpose`=?,`bid`=?,`uid`=?,`partyName`=?,`pid`=?,`remark`=?,`catid`=?";
        let queryParams = [
            dateup,
            amount,
            purpose,
            bid,
            uid,
            partyname,
            pid,
            remark,
            category
        ];
        query += "WHERE `id`=?";
        queryParams.push(exid);
        connection.query(query, queryParams, (err, result) => {
            if (err) {
                console.error("Error executing UPDATE query: ", err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: "Expense not found" });
                }
                console.log("Expense updated successfully:", result);
                return res.json({
                    data: result,
                    code: 200,
                });
            }
        });
    });

    app.post("/deleteExpense", (req, res) => {
        const id = parseInt(req.body.id);
        connection.query("DELETE FROM `transaction` WHERE `id`=?", [id], (err, rows) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                // console.log(rows);
                return res.json({
                    data: rows,
                    code: 200,
                });
            }
        });
    });

    function formatDate(inputDate) {
        const date = new Date(inputDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${day}-${month}`;
    }

    app.post("/sendmail", upload.single("agreement"), async (req, res) => {
        const email = req.body.email;
        const transporter = nodemailer.createTransport({
            host: "mail.evonitsolution.com",
            port: 587,
            secure: false,
            auth: {
                user: "anvekar@evonitsolution.com",
                pass: "anvekar@@@",
            },
        });

        try {
            const info = await transporter.sendMail({
                from: '"Anvekar" <anvekar@evonitsolution.com>',
                to: email,
                subject: "Plot Sale Agreement",
                text: "",
                attachments: [
                    {
                        filename: req.file.originalname,
                        content: req.file.buffer,
                        contentType: 'application/pdf'
                    },
                ],
            });
            console.log("Email sent: %s", info.messageId);
            return res.json({
                data: "Email sent successfully",
                code: 200,
            });
        } catch (error) {
            console.error("Error occurred while sending email:", error);
            return res.status(500).json({
                data: "Failed to send email",
                code: 500,
            });
        }
    });
    app.post("/addcategory", upload.none(), (req, res) => {
        console.log(req.body);
        const { addtype, addcategory, id } = req.body;
        // console.log(addcategory);
        connection.query("SELECT * FROM `category` WHERE `category`=?", [addcategory.trim()], (err, result) => {
            if (err) {
                console.error("Error executing INSERT query: ", err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                console.log(result.length);
                if (result.length > 0) {
                    return res.json({
                        message: "Category Is Already Added",
                        data: result,
                        code: 201,
                    });
                } else {
                    connection.query("INSERT INTO `category`(`type`,`category`)VALUES(?,?)", [
                        addtype,
                        addcategory.trim(),
                    ], (err, resul) => {
                        if (err) {
                            console.error("Error executing INSERT query: ", err);
                            return res.status(500).json({ error: "Internal server error" });
                        } else {
                            return res.json({
                                data: resul,
                                code: 200,
                            });
                        }
                    })
                }
            }
        })
    });

    app.post("/updatecategory", upload.none(), (req, res) => {
        const { addtype, addcategory, id } = req.body;
        connection.query("SELECT * FROM `category` WHERE `category`=? AND `id` !=?", [addcategory, id], (err, result) => {
            if (err) {
                console.error("Error executing INSERT query: ", err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                if (result.length > 0) {
                    return res.json({
                        message: "Category Is Already Added",
                        data: result,
                        code: 201,
                    });
                } else {
                    connection.query("UPDATE `category` SET `type`=?,`category`=? WHERE id=?", [
                        addtype,
                        addcategory,
                        id
                    ], (err, result) => {
                        if (err) {
                            console.error("Error executing INSERT query: ", err);
                            return res.status(500).json({ error: "Internal server error" });
                        } else {
                            console.log("Statement added successfully:", result);
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

    app.post("/fetchCategoryData", upload.none(), (req, res) => {
        let query = '';
        query = "SELECT * FROM `category`";
        connection.query(query, (err, rows) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                // console.log(rows);
                return res.json({
                    data: rows,
                    code: 200,
                });
            }
        });
    });


    app.post("/deleteCategory", (req, res) => {
        const delid = parseInt(req.body.delid);
        let query = "";

        connection.query("SELECT `catid` FROM `allpayment` WHERE `catid` = ?", [delid], (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                if (rows.length > 0) {
                    return res.json({
                        data: rows,
                        code: 201,
                    });
                } else {
                    connection.query("Delete FROM `category` WHERE `id`=?", [delid], (err, rows1) => {
                        if (err) {
                            console.log(err)
                            return res.status(500).json({ error: "Internal server error" });
                        } else {
                            return res.json({
                                data: "Category Deleted",
                                code: 200,
                            });
                        }
                    });
                }
            }
        });
    });

    app.post("/addStatementForm1", upload.none(), (req, res) => {
        const dateDEFAULT = new Date();
        const { addtype, category, purpose, paymentType, transaction, payType, date, branch, crdr, track, cateid, discription } = req.body;
        const splitarrays = req.body.splitArrays;
        const splitArrays = JSON.parse(splitarrays);
        console.log(req.body);
        if (transaction == "undefined") {
            let transaction1 = "";
        } else {
            let transaction1 = transaction;
        }
        const insertAllPayment = () => {
            return new Promise((resolve, reject) => {
                connection.query(
                    "INSERT INTO `allpayment`(`addype`, `catid`, `purpose`, `paymentType`, `transaction`,`date`, `dateup`, `defaultdate`,`bid`,`paytype`,`track`,`description`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
                    [addtype, cateid, purpose, paymentType, transaction, date, date, dateDEFAULT, branch, payType, track, discription],
                    (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(result.insertId);
                    }
                );
            });
        };

        const insertPaymentTransaction = (paymentId, item) => {
            return new Promise((resolve, reject) => {
                const { partyName, landowner, landownerid, servenumber, projectName, pid, customer, cid, plotnum, Sid, amount, venId, qty, rate } = item;

                const finalQty = qty === null ? 0 : qty;
                const finalRate = rate === null ? 0 : rate;
                connection.query(
                    "INSERT INTO `paymenttransaction`(`partyName`, `lid`, `serveNumber`, `pid`, `cid`, `plonum`, `Amount`, `sid`,`tranid`,`vid`,`qty`,`rate`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                    [partyName, landownerid, servenumber, pid, cid, plotnum, amount, Sid, paymentId, venId, finalQty, finalRate],
                    (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(result);
                    }
                );
            });
        };

        insertAllPayment()
            .then((paymentId) => {
                const transactionPromises = splitArrays.map((item) => insertPaymentTransaction(paymentId, item));
                return Promise.all(transactionPromises);
            })
            .then(() => {
                return res.json({
                    data: 'Added',
                    message: "Transactions inserted successfully.",
                    code: 200
                });
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ Error: "Internal Server Error" });
            });
    });


    app.post("/updateStatementForm1", upload.none(), (req, res) => {
        const dateDEFAULT = new Date();
        const { addtype, category, purpose, paymentType, transaction, cheques, payType, date, branch, crdr, track, cateid, transid } = req.body;
        const splitArrays = JSON.parse(req.body.splitArrays);

        let transaction1 = transaction === "undefined" ? "" : transaction;

        const insertAllPayment = () => {
            return new Promise((resolve, reject) => {
                connection.query(
                    "UPDATE `allpayment` SET `addype`= ?,`catid`= ?,`purpose`= ?,`paymentType`= ?,`transaction`= ?,`cheque`= ?,`paytype`= ?,`date`= ?,`dateup`= ?,`track`= ?,`bid`= ? WHERE id = ?",
                    [addtype, cateid, purpose, paymentType, transaction1, cheques, payType, date, dateDEFAULT, track, branch, transid],
                    (err, result) => {
                        if (err) {
                            return reject(new Error("Failed to update `allpayment` table."));
                        }
                        connection.query("DELETE FROM `paymenttransaction` WHERE tranid = ?", [transid], (err, rows) => {
                            if (err) {
                                return reject(new Error("Failed to delete from `paymenttransaction` table."));
                            } else {
                                resolve(transid);
                            }
                        });
                    }
                );
            });
        };

        const insertPaymentTransaction = (paymentId, item) => {
            return new Promise((resolve, reject) => {
                const { partyName, landowner, landownerid, servenumber, projectName, pid, customer, cid, plotnum, Sid, amount, rate, qty } = item;
                connection.query(
                    "INSERT INTO `paymenttransaction`(`partyName`, `lid`, `serveNumber`, `pid`, `cid`, `plonum`, `Amount`, `sid`, `tranid`,`rate`,`qty`) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                    [partyName, landownerid, servenumber, pid, cid, plotnum, amount, Sid, paymentId, rate, qty],
                    (err, result) => {
                        if (err) {
                            return reject(new Error("Failed to insert into `paymenttransaction` table."));
                        }
                        resolve(result);
                    }
                );
            });
        };

        insertAllPayment()
            .then((paymentId) => {
                const transactionPromises = splitArrays.map((item) => insertPaymentTransaction(paymentId, item));
                return Promise.all(transactionPromises);
            })
            .then(() => {
                return res.json({
                    data: 'Added',
                    message: "Transactions updated successfully.",
                    code: 200
                });
            })
            .catch((err) => {
                console.error("Error during transaction update:", err);
                return res.status(500).json({ Error: "Internal Server Error", details: err.message });
            });
    });



    // app.post("/addStatementForm",upload.none(), (req, res) => 
    // {
    //     const {date,branch,addtype,category,amount,partyName,landowner,customer,project,plotnum,purpose,remark,paymentMode,transaction,cheque,landownerID,customerID,chequeNumber,uid,servenumber,PaymentType,description,track}=req.body;
    //     const amountNow=parseFloat(amount);
    //     const chequeNumbers = JSON.parse(chequeNumber);
    //     const dateDEFAULT = new Date();
    //     if(addtype=='Customer Payment')
    //     {

    //         connection.query("SELECT `plotsale`.*,`saleplotdetails`.`plotid`,`saleplotdetails`.`plotamt` FROM `plotsale`,`saleplotdetails` WHERE `plotsale`.`id`=`saleplotdetails`.`sid` AND `plotsale`.`cid`=? AND `saleplotdetails`.`plotid`=?",[customerID,plotnum],(err,rows)=>{
    //             if(err)
    //             {
    //                 console.log(err)
    //                 return res.status(500).json({error: "Internal server error"});
    //             }else
    //             {
    //                 if(rows.length > 0)
    //                 {
    //                     var cid=rows[0].cid;
    //                     var sid=rows[0].id;
    //                     var totalamt=parseFloat(rows[0].totalamt);
    //                     connection.query("SELECT SUM(`Amount`) AS `totalPaid` FROM `transaction` WHERE `sid`=?",[sid],(err,payrows)=>{
    //                         if(err)
    //                         {
    //                             console.log(err)
    //                             return res.status(500).json({error:"Internal server error"});
    //                         }else
    //                         {
    //                             var totalPaid=parseFloat(payrows[0].totalPaid);
    //                             var remainAmount=totalamt-totalPaid;
    //                             var lastTotalAmount=amountNow+totalPaid;
    //                             if(amountNow > remainAmount)
    //                             {
    //                                 return res.json({
    //                                     data:totalPaid,
    //                                     message:"Here Plot Pending Amount Is "+ remainAmount.toFixed(2),
    //                                     code:203
    //                                 });
    //                             }else
    //                             {
    //                                 connection.query("INSERT INTO `transaction`(`sid`,`Amount`,`amountType`, `pmode`, `transaction`, `chequeNumber`,`addtype`, `category`,`date`, `dateup`, `defaultDate`,`bid`,`uid`,`purpose`,`remark`,`description`,`track`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    //                                     [
    //                                         sid,
    //                                         amountNow,
    //                                         PaymentType,
    //                                         paymentMode,
    //                                         transaction,
    //                                         JSON.stringify(chequeNumbers),
    //                                         addtype,
    //                                         category,
    //                                         date,
    //                                         dateDEFAULT,
    //                                         dateDEFAULT,
    //                                         branch,
    //                                         uid,
    //                                         purpose,
    //                                         remark,
    //                                         description,
    //                                         track,
    //                                     ],(err,rowInsert)=>
    //                                     {
    //                                         console.log(err);
    //                                         if(err)
    //                                         {
    //                                             return res.status(500).json({error:"Internal Server Error"});
    //                                         }else
    //                                         {
    //                                             if(lastTotalAmount==totalamt)
    //                                             {
    //                                                 connection.query("UPDATE plotsale SET status=1 WHERE id=?",[sid],(err,rows)=>{
    //                                                     if(err)
    //                                                     {
    //                                                         console.log(err);
    //                                                         return res.status(500).json({ error: "Internal server error" });
    //                                                     }else
    //                                                     {
    //                                                         return res.json({
    //                                                             data:rowInsert,
    //                                                             message:"Customer Payed All His Pending Amount",
    //                                                             code:200
    //                                                         });
    //                                                     }
    //                                                 });
    //                                             }else
    //                                             {
    //                                                 return res.json({
    //                                                     data:rowInsert,
    //                                                     message:"Customer Payment Added SuccessFully",
    //                                                     code:200
    //                                                 });
    //                                             }
    //                                         }
    //                                     }
    //                                 )
    //                             }
    //                         }
    //                     });
    //                 }else
    //                 {
    //                     return res.json({
    //                         data: "",
    //                         message:"Any plot Is Not Saled For This Customer",
    //                         code: 202,
    //                     });
    //                 }
    //             }
    //         });
    //     }else if(addtype=='Land Owner')
    //     {
    //         connection.query("INSERT INTO `transaction`(`Amount`,`amountType`,`pmode`,`transaction`, `chequeNumber`,`addtype`,`category`,`landownerid`,`pid`,`date`, `dateup`,`defaultDate`,`bid`,`uid`,`purpose`,`remark`,`description`,`track`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    //             [
    //                 amountNow,
    //                 PaymentType,
    //                 paymentMode,
    //                 transaction,
    //                 JSON.stringify(chequeNumbers),
    //                 addtype,
    //                 category,
    //                 landownerID,
    //                 project,
    //                 date,
    //                 dateDEFAULT,
    //                 dateDEFAULT,
    //                 branch,
    //                 uid,
    //                 purpose,
    //                 remark,
    //                 description,
    //                 track
    //             ],(err,RowInsert)=>{
    //                 if(err)
    //                 {
    //                     console.log(err)
    //                     return res.status(500).json({error:"Internal Server Error"})
    //                 }else
    //                 {
    //                     return res.json({
    //                         data:RowInsert,
    //                         message:"Land Owner Payment Successfull",
    //                         code:200
    //                     });
    //                 }
    //         })
    //     }else if(addtype=='Office')
    //     {
    //         connection.query("INSERT INTO `transaction`(`Amount`, `amountType`, `pmode`, `transaction`, `chequeNumber`,`addtype`,`category`,`date`, `dateup`, `defaultDate`,`bid`,`uid`,`purpose`,`remark`,`partyName`,`description`,`track`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    //             [
    //                 amountNow,
    //                 PaymentType,
    //                 paymentMode,
    //                 transaction,
    //                 JSON.stringify(chequeNumbers),
    //                 addtype,
    //                 category,
    //                 date,
    //                 dateDEFAULT,
    //                 dateDEFAULT,
    //                 branch,
    //                 uid,
    //                 purpose,
    //                 remark,
    //                 partyName,
    //                 description,
    //                 track
    //             ],(err,officeInsert)=>
    //             {
    //                 if(err)
    //                 {
    //                     console.log(err)
    //                     return res.status(500).json({error:"Internal Server Error"})
    //                 }else
    //                 {
    //                     return res.json({
    //                         data:officeInsert,
    //                         message:"Added To Office Expense",
    //                         code:200
    //                     });
    //                 }

    //         })
    //     }else if(addtype=='Banking')
    //     {
    //         connection.query("INSERT INTO `transaction`(`Amount`, `amountType`, `pmode`, `transaction`, `chequeNumber`,`addtype`,`category`,`date`,`dateup`,`defaultDate`,`bid`,`uid`,`purpose`,`remark`,`description`,`track`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    //             [
    //                 amountNow,
    //                 PaymentType,
    //                 paymentMode,
    //                 transaction,
    //                 JSON.stringify(chequeNumbers),
    //                 addtype,
    //                 category,
    //                 date,
    //                 dateDEFAULT,
    //                 dateDEFAULT,
    //                 branch,
    //                 uid,
    //                 purpose,
    //                 remark,
    //                 description,
    //                 track
    //             ],
    //             (err,BankingInsert)=>
    //             {
    //                 if(err)
    //                 {
    //                     console.log(err)
    //                     return res.status(500).json({error:"Internal Server Error"});
    //                 }else
    //                 {
    //                     return res.json({
    //                         data:BankingInsert,
    //                         message:"Added To Bankig",
    //                         code:200
    //                     });
    //                 }
    //             })
    //     }else if(addtype=='Project')
    //     {
    //         connection.query("INSERT INTO `transaction`(`Amount`, `amountType`, `pmode`, `transaction`, `chequeNumber`,`addtype`,`category`,`date`,`dateup`,`defaultDate`,`bid`,`uid`,`purpose`,`remark`,`description`,`track`,`pid`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    //             [
    //                 amountNow,
    //                 PaymentType,
    //                 paymentMode,
    //                 transaction,
    //                 JSON.stringify(chequeNumbers),
    //                 addtype,
    //                 category,
    //                 date,
    //                 dateDEFAULT,
    //                 dateDEFAULT,
    //                 branch,
    //                 uid,
    //                 purpose,
    //                 remark,
    //                 description,
    //                 track,
    //                 project,
    //             ],
    //             (err,BankingInsert)=>
    //             {
    //                 if(err)
    //                 {
    //                     console.log(err)
    //                     return res.status(500).json({error:"Internal Server Error"});
    //                 }else
    //                 {
    //                     return res.json({
    //                         data:BankingInsert,
    //                         message:"Project Expense Added Succesfully",
    //                         code:200
    //                     });
    //                 }
    //             })
    //     }
    // });

    app.post("/transactionlists", upload.none(), (req, res) => {
        const fromdate = req.body.fromdate;
        const todate = req.body.todate;
        const query = `SELECT t.*,
                        CASE 
                            WHEN t.sid IS NULL THEN NULL
                            ELSE c.fullname
                        END AS fullname,
                        CASE
                            WHEN t.sid IS NULL THEN NULL
                            ELSE c.cid
                        END AS cid,
                        CASE
                            WHEN t.landownerid IS NULL THEN NULL
                            ELSE l.name
                        END AS name,
                        CASE
                            WHEN t.pid IS NULL THEN NULL
                            ELSE p.pname
                        END AS pname,
                        CASE
                            WHEN t.category IS NULL THEN NULL
                            ELSE ca.category
                        END AS categoryName
                    FROM
                        transaction t
                    LEFT JOIN
                        plotsale s ON t.sid=s.id
                    LEFT JOIN
                        customer c ON s.cid=c.cid
                    LEFT JOIN
                        landowner l ON t.landownerid=l.id
                    LEFT JOIN
                        project p ON t.pid=p.pid
                    LEFT JOIN
                        category ca ON t.category=ca.id
                    WHERE t.date BETWEEN ? AND ?`;
        connection.query(query, [fromdate, todate], (err, rows) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: "Internal Server Error" });
            } else {
                console.log(rows);
                return res.json({
                    data: rows,
                    message: 'Transactions Rows',
                    code: 200
                })
            }
        })
    });

    app.post("/fetchPaymentHistoray", upload.none(), (req, res) => {
        const { fromdate, todate } = req.body;
        connection.query(`SELECT 
                    allpayment.addype, 
                    allpayment.paytype, 
                    allpayment.catid,
                    allpayment.purpose, 
                    allpayment.paymentType, 
                    allpayment.date,
                    allpayment.cheque,
                    allpayment.transaction,
                    allpayment.bid,
                    allpayment.description,
                    paymenttransaction.*,
                    category.category,
                    CASE
                        WHEN paymenttransaction.cid IS NULL THEN NULL
                        ELSE customer.fullname
                    END AS customer_name,
                    CASE
                        WHEN paymenttransaction.lid IS NULL THEN NULL
                        ELSE landowner.name
                    END AS landownerName,
                    CASE
                        WHEN paymenttransaction.pid IS NULL THEN NULL
                        ELSE project.pname
                    END AS projectName
                FROM 
                    paymenttransaction 
                JOIN 
                    allpayment
                ON
                    paymenttransaction.tranid = allpayment.id
                JOIN 
                    category
                ON
                    allpayment.catid = category.id
                LEFT JOIN 
                    customer
                ON
                    customer.cid = paymenttransaction.cid
                LEFT JOIN 
                    landowner 
                ON
                    landowner.id = paymenttransaction.lid
                LEFT JOIN 
                    project
                ON
                    project.pid = paymenttransaction.pid
                WHERE allpayment.date BETWEEN ? and ? ORDER BY allpayment.date ASC`, [fromdate, todate], (err, row) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: "Internal Server Error" });
            } else {
                return res.json(
                    {
                        data: row,
                        message: 'Transaction Row',
                        code: 200,
                    })
            }
        }
        );
    });

    // fetchPaymentHistorayByMonthWise
    app.post("/fetchPaymentHistorayByMonthWise", upload.none(), (req, res) => {
        const { fromdate, todate } = req.body;
        connection.query(`SELECT 
                                allpayment.addype, 
                                allpayment.catid,
                                category.category,
                                allpayment.bid,
                                SUM(CASE WHEN allpayment.paytype = 'Credit' THEN paymenttransaction.Amount ELSE 0 END) AS total_credit_amount,
                                SUM(CASE WHEN allpayment.paytype = 'Debit' THEN paymenttransaction.Amount ELSE 0 END) AS total_debit_amount
                            FROM
                                paymenttransaction 
                            JOIN 
                                allpayment ON paymenttransaction.tranid = allpayment.id
                            JOIN 
                                category ON allpayment.catid = category.id
                            WHERE 
                                allpayment.date BETWEEN ? AND ?
                            GROUP BY 
                                allpayment.bid, allpayment.catid, category.category`, [fromdate, todate], (err, row) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: "Internal Server Error" });
            } else {
                console.log(row);
                return res.json(
                    {
                        data: row,
                        message: 'Transaction Row',
                        code: 200,
                    })
            }
        }
        );
    });

    app.post("/sidupdateproject", upload.none(), (req, res) => {
        const sid = req.body.sid;
        const query = `
                SELECT plotsale.*, saleplotdetails.plotid
                FROM plotsale
                LEFT JOIN (
                    SELECT * 
                    FROM saleplotdetails
                    ORDER BY id  -- You can use the appropriate column to sort and get the "first" row
                    LIMIT 1
                ) AS saleplotdetails ON plotsale.id = saleplotdetails.sid
                WHERE plotsale.id = ?`;
        connection.query(query, [sid], (err, rows) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Internal Server Error" });
            } else {
                // console.log(rows);
                return res.json({
                    data: rows,
                    message: 'Transactions Rows',
                    code: 200
                })
            }
        })
    });

    app.post("/updateStatementForm", upload.none(), (req, res) => {
        console.log(req.body);
        const { transId, date, branch, addtype, category, amount, partyName, landowner, customer, project, plotnum, purpose, remark, paymentMode, transaction, cheque, landownerID, customerID, chequeNumber, uid, servenumber, PaymentType, description, track } = req.body;
        const amountNow = parseFloat(amount);
        const chequeNumbers = JSON.parse(chequeNumber);
        console.log(chequeNumbers);
        const dateDEFAULT = new Date();
        if (addtype == 'Customer Payment') {
            connection.query("SELECT `plotsale`.*,`saleplotdetails`.`plotid`,`saleplotdetails`.`plotamt` FROM `plotsale`,`saleplotdetails` WHERE `plotsale`.`id`=`saleplotdetails`.`sid` AND `plotsale`.`cid`=? AND `saleplotdetails`.`plotid`=?", [customerID, plotnum], (err, rows) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({ error: "Internal server error" });
                } else {
                    if (rows.length > 0) {
                        var cid = rows[0].cid;
                        var sid = rows[0].id;
                        var totalamt = parseFloat(rows[0].totalamt);
                        connection.query("SELECT SUM(`Amount`) AS `totalPaid` FROM `transaction` WHERE `sid`=? AND id !=?", [sid, transId], (err, payrows) => {
                            if (err) {
                                console.log(err)
                                return res.status(500).json({ error: "Internal server error" });
                            } else {
                                var totalPaid = parseFloat(payrows[0].totalPaid);
                                var remainAmount = totalamt - totalPaid;
                                var lastTotalAmount = amountNow + totalPaid;
                                if (amountNow > remainAmount) {
                                    return res.json({
                                        data: totalPaid,
                                        message: "Here Plot Pending Amount Is " + remainAmount.toFixed(2),
                                        code: 203
                                    });
                                } else {
                                    connection.query("UPDATE `transaction` SET `sid`=?,`Amount`=?,`amountType`=?,`pmode`=?,`transaction`=?,`chequeNumber`=?,`addtype`=?,`category`=?,`date`=?,`dateup`=?,`bid`=?,`uid`=?,`purpose`=?,`remark`=?,`track`=?,`landownerid`=?,`pid`=?,`partyName`=?,`serveNumber`=? WHERE `id`=?",
                                        [
                                            sid,
                                            amountNow,
                                            PaymentType,
                                            paymentMode,
                                            transaction,
                                            JSON.stringify(chequeNumbers),
                                            addtype,
                                            category,
                                            date,
                                            dateDEFAULT,
                                            branch,
                                            uid,
                                            purpose,
                                            remark,
                                            track,
                                            null,
                                            null,
                                            null,
                                            null,
                                            transId
                                        ], (err, updatarows) => {
                                            console.log(err);
                                            if (err) {
                                                return res.status(500).json({ error: "Internal Server Error" });
                                            } else {
                                                if (lastTotalAmount == totalamt) {
                                                    connection.query("UPDATE plotsale SET status=1 WHERE id=?", [sid], (err, rows) => {
                                                        if (err) {
                                                            console.log(err);
                                                            return res.status(500).json({ error: "Internal server error" });
                                                        } else {
                                                            return res.json({
                                                                data: updatarows,
                                                                message: "Customer Payed All His Pending Amount",
                                                                code: 200
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    return res.json({
                                                        data: updatarows,
                                                        message: "Customer Payment Added SuccessFully Updated",
                                                        code: 200
                                                    });
                                                }
                                            }
                                        }
                                    )
                                }
                            }
                        });
                    }
                }
            });
        } else if (addtype == 'Land Owner') {
            connection.query("UPDATE `transaction` SET `Amount`=?,`amountType`=?,`pmode`=?,`transaction`=?,`chequeNumber`=?,`addtype`=?,`category`=?,`landownerid`=?,`pid`=?,`date`=?,`dateup`=?,`bid`=?,`uid`=?,`purpose`=?,`remark`=?,`track`=?,`sid`=?,`partyName`=? WHERE id=?",
                [
                    amountNow,
                    PaymentType,
                    paymentMode,
                    transaction,
                    JSON.stringify(chequeNumbers),
                    addtype,
                    category,
                    landownerID,
                    project,
                    date,
                    dateDEFAULT,
                    branch,
                    uid,
                    purpose,
                    remark,
                    track,
                    null,
                    null,
                    transId
                ], (err, RowInsert) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).json({ error: "Internal Server Error" })
                    } else {
                        return res.json({
                            data: RowInsert,
                            message: "Land Owner Payment Successfull Updated",
                            code: 200
                        });
                    }
                })
        } else if (addtype == 'Office') {
            connection.query("UPDATE `transaction` SET `Amount`=?, `amountType`=?, `pmode`=?, `transaction`=?, `chequeNumber`=?,`addtype`=?,`category`=?,`date`=?, `dateup`=?,`bid`=?,`uid`=?,`purpose`=?,`remark`=?,`partyName`=?,`track`=?,`sid`=?,`landownerid`=?,`pid`=?,`serveNumber`=? WHERE id=?",
                [
                    amountNow,
                    PaymentType,
                    paymentMode,
                    transaction,
                    JSON.stringify(chequeNumbers),
                    addtype,
                    category,
                    date,
                    dateDEFAULT,
                    branch,
                    uid,
                    purpose,
                    remark,
                    partyName,
                    track,
                    null,
                    null,
                    null,
                    null,
                    transId
                ], (err, officeInsert) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({ error: "Internal Server Error" })
                } else {
                    return res.json({
                        data: officeInsert,
                        message: "Added To Office Expense",
                        code: 200
                    });
                }

            })
        } else if (addtype == 'Banking') {
            connection.query("UPDATE `transaction` SET `Amount`=?, `amountType`=?, `pmode`=?, `transaction`=?, `chequeNumber`=?,`addtype`=?,`category`=?,`date`=?,`dateup`=?,`bid`=?,`uid`=?,`purpose`=?,`remark`=?,`track`=?,`sid`=?,`landownerid`=?,`pid`=?,`partyName`=?,`serveNumber`=? WHERE id=?",
                [
                    amountNow,
                    PaymentType,
                    paymentMode,
                    transaction,
                    JSON.stringify(chequeNumbers),
                    addtype,
                    category,
                    date,
                    dateDEFAULT,
                    branch,
                    uid,
                    purpose,
                    remark,
                    track,
                    null,
                    null,
                    null,
                    null,
                    null,
                    transId
                ],
                (err, BankingInsert) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).json({ error: "Internal Server Error" });
                    } else {
                        console.log(BankingInsert)
                        return res.json({
                            data: BankingInsert,
                            message: "Bankig Transaction Updated",
                            code: 200
                        });
                    }
                })
        }
        else if (addtype == 'Project') {
            connection.query("UPDATE `transaction` SET `Amount`=?, `amountType`=?, `pmode`=?, `transaction`=?, `chequeNumber`=?,`addtype`=?,`category`=?,`date`=?,`dateup`=?,`bid`=?,`uid`=?,`purpose`=?,`remark`=?,`track`=?,`pid`=?,`sid`=?,`landownerid`=?,`partyName`=?,`serveNumber`=? WHERE id=?",
                [
                    amountNow,
                    PaymentType,
                    paymentMode,
                    transaction,
                    JSON.stringify(chequeNumbers),
                    addtype,
                    category,
                    date,
                    dateDEFAULT,
                    branch,
                    uid,
                    purpose,
                    remark,
                    track,
                    project,
                    null,
                    null,
                    null,
                    null,
                    transId
                ],
                (err, BankingInsert) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).json({ error: "Internal Server Error" });
                    } else {
                        return res.json({
                            data: BankingInsert,
                            message: "Project Expense Updated Succesfully",
                            code: 200
                        });
                    }
                })
        }
    })

    app.post("/FetchTransactionsList", upload.none(), (req, res) => {
        console.log(req.body);
        const transid = req.body.transid;
        connection.query(`
                SELECT
                    paymenttransaction.*,
                    CASE
                        WHEN paymenttransaction.cid IS NULL THEN NULL
                        ELSE customer.fullname
                    END AS customer_name,
                    CASE
                        WHEN paymenttransaction.lid IS NULL THEN NULL
                        ELSE landowner.name
                    END AS landownerName,
                    CASE
                        WHEN paymenttransaction.pid IS NULL THEN NULL
                        ELSE project.pname
                    END AS projectName
                    FROM 
                        paymenttransaction 
                        LEFT JOIN 
                        customer 
                    ON
                        customer.cid = paymenttransaction.cid
                    LEFT JOIN 
                        landowner 
                    ON
                        landowner.id = paymenttransaction.lid
                    LEFT JOIN 
                        project 
                    ON
                        project.pid = paymenttransaction.pid
                    WHERE paymenttransaction.tranid=?
                    `, [transid], (err, rows) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: "Internal Server Error" });
            } else {
                return res.json(
                    {
                        data: rows,
                        message: 'Transaction Row',
                        code: 200,
                    }
                )


            }
        })
    })

    app.post("/deleteTransaction", upload.none(), (req, res) => {
        console.log(req.body);
        const transid = req.body.tranid;

        // Assuming you're using MySQL, here's how you can execute two DELETE queries
        const deleteFromAllPaymentQuery = "DELETE FROM allpayment WHERE id = ?";
        const deleteFromPaymentTransactionQuery = "DELETE FROM paymenttransaction WHERE tranid = ?";

        // Start a transaction to ensure both queries execute atomically
        connection.beginTransaction((err) => {
            if (err) {
                return res.status(500).json({ message: "Error starting transaction", error: err });
            }

            // Delete from allpayment table
            connection.query(deleteFromAllPaymentQuery, [transid], (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).json({ message: "Error deleting from allpayment", error: err });
                    });
                }

                // Delete from paymenttransaction table
                connection.query(deleteFromPaymentTransactionQuery, [transid], (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            res.status(500).json({ message: "Error deleting from paymenttransaction", error: err });
                        });
                    }

                    // Commit the transaction if both queries succeed
                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                res.status(500).json({ message: "Error committing transaction", error: err });
                            });
                        }

                        // Send a successful response
                        // res.status(200).json({ message: "Transaction deleted successfully" });
                        return res.json(
                            {
                                data: "",
                                message: 'Transaction deleted successfully',
                                code: 200,
                            }
                        )
                    });
                });
            });
        });
    });

}




// in the table allpayment
// id  catid pay