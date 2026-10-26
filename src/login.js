const multer=require('multer');
const path=require('path');
module.exports = function (app, connection) 
{
    
    app.post("/login", (req, res) => 
    {
        // const category=48;
        // const bid=1;
        // const uid=0;
        // const track=0;
        // connection.query("SELECT tempexpense.*,category.type AS addtype FROM tempexpense,category WHERE tempexpense.type !='Office' AND tempexpense.catid=category.id",(err, rows) => 
        // {
        //     if(err)
        //     {
                
        //     }else
        //     {
        //         console.log(rows.length);
        //         rows.forEach((row, index) => 
        //         {
        //             console.log(`Row ${index}:`, row);
        //         //     connection.query("INSERT INTO `transaction`(`Amount`, `amountType`, `pmode`, `transaction`, `chequeNumber`,`addtype`,`category`,`date`, `dateup`, `defaultDate`,`bid`,`uid`,`purpose`,`remark`,`partyName`,`description`,`track`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        //         // [
        //         //     row.amount,
        //         //     'Debit',
        //         //     'Cheque',
        //         //     '',
        //         //     '',
        //         //     'Office',
        //         //     row.catid,
        //         //     row.date,
        //         //     row.dateup,
        //         //     row.date,
        //         //     bid,
        //         //     uid,
        //         //     row.purpose,
        //         //     '',
        //         //     row.partyName,
        //         //     row.description,
                    
        //         //     category,
        //         //     date,
        //         //     dateDEFAULT,
        //         //     dateDEFAULT,
        //         //     branch,
        //         //     uid,
        //         //     purpose,
        //         //     remark,
        //         //     partyName,
        //         //     description,
        //         //     track
        //         // ],(err,officeInsert)=>
        //         // {
        //         //     if(err)
        //         //     {
        //         //         console.log(err)
        //         //         return res.status(500).json({error:"Internal Server Error"})
        //         //     }else
        //         //     {
        //         //         // return res.json({
        //         //         //     data:officeInsert,
        //         //         //     message:"Added To Office Expense",
        //         //         //     code:200
        //         //         // });
        //         //     }
        //         // })
        //         });
        //     }
        // });

        // ?console.log(req.body);
        const uname=req.body.username;
        const pass=req.body.password;
        connection.query("SELECT * FROM login WHERE uname=? AND pass=?",[uname,pass],(err, rows) => {
            if (err) 
            {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            }else
            {
                if (rows.length > 0) 
                {
                    const empid=rows[0].empid;
                    const type=rows[0].type;
                    if(empid !==0)
                    {
                        connection.query("SELECT branch.brandName,branch.id FROM employee INNER JOIN branch ON employee.branch_id = branch.id WHERE employee.emp_id = ?",[empid],(err, empRows) => {
                            if (err) 
                            {
                                console.log(err);
                                return res.status(500).json({ error: "Internal server error" });
                            }else
                            {
                                const branchName = empRows[0].brandName;
                                const bid = empRows[0].id;
                                return res.json({ branchName, empid, type,bid, code: 200 });
                            }
                        });
                    }else
                    {
                        const branchName="none";
                        const bid=0;
                        return res.json({ branchName, empid, type, bid, code: 200 });
                    }
                }else
                {
                    return res.json({
                        code:201
                    })
                }
            }
        });
    });

    app.post("/logindata", (req, res) => {
        console.log(req.body);
        return res.json({
            data: req.body,
            code: 200,
          });
    });


    // app.post("/datamearge", (req, res) => 
    // {
    //     const category=49;
    //     const bid=1;
    //     const uid=0;
    //     const track=2;
    //     // connection.query("SELECT tempexpense.*,category.type AS addtype FROM tempexpense,category WHERE tempexpense.type !='Office' AND tempexpense.catid=category.id",(err, rows) => 
    //     connection.query("SELECT * FROM `payment`",(err, rows) => 
    //     {
    //         if(err)
    //         {
    //             return res.status(500).json({error:"Internal Server Error"})
    //         }else
    //         {
    //             console.log(rows.length);
    //             rows.forEach((row, index) => 
    //             {
    //                 // console.log(`Row ${index}:`, row);
    //                 //INSERT INTO `transaction`(`id`, `sid`, `Amount`, `amountType`, `pmode`, `transaction`, `chequeNumber`, `chequesImage`, `addtype`, `category`, `landownerid`, `pid`, `partyName`, `date`, `dateup`, `defaultDate`, `track`, `status`, `lastUpdatedData`, `bid`, `uid`, `purpose`, `remark`, `description`, `serveNumber`) VALUES ('[value-1]','[value-2]','[value-3]','[value-4]','[value-5]','[value-6]','[value-7]','[value-8]','[value-9]','[value-10]','[value-11]','[value-12]','[value-13]','[value-14]','[value-15]','[value-16]','[value-17]','[value-18]','[value-19]','[value-20]','[value-21]','[value-22]','[value-23]','[value-24]','[value-25]')
    //                 connection.query("INSERT INTO `transaction`(`sid`,`Amount`, `amountType`, `pmode`,`chequeNumber`, `chequesImage`, `addtype`, `category`,`date`,`dateup`, `defaultDate`, `track`,`bid`,`uid`,`purpose`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    //             [
    //                 row.sid,
    //                 row.paid,
    //                 'Credit',
    //                 row.pmode,
    //                 row.chequeNumber,
    //                 row.chequesImage,
    //                 'Customer Payment',
    //                 category,
    //                 row.date,
    //                 row.date,
    //                 row.date,
    //                 track,
    //                 bid,
    //                 uid,
    //                 '',
    //             ],(err,officeInsert)=>
    //             {
    //                 if(err)
    //                 {
    //                     console.log(err)
    //                     return res.status(500).json({error:"Internal Server Error"})
    //                 }else
    //                 {
    //                     // return res.json({
    //                     //     data:rows,
    //                     //     message:"Added To Office Expense",
    //                     //     code:200
    //                     // });
    //                     console.log(officeInsert)
    //                 }
    //             })
    //             });
    //             // return res.json({
    //             //     data:rows,
    //             //     message:"Added To Office Expense",
    //             //     code:200
    //             // });
    //         }
    //     });
    // });

    app.post("/datamearge", (req, res) => 
    {
        const category=49;
        const bid=1;
        const uid=0;
        const track=0;
        // connection.query("SELECT tempexpense.*,category.type AS addtype FROM tempexpense,category WHERE tempexpense.type !='Office' AND tempexpense.catid=category.id",(err, rows) => 
        connection.query("SELECT tempexpense.*,category.type AS addtype FROM tempexpense,category WHERE tempexpense.catid=category.id",(err, rows) => 
        {
            if(err)
            {
                return res.status(500).json({error:"Internal Server Error"})
            }else
            {
                console.log(rows.length);
                // "id": 30,
                // "date": "2024-08-05",
                // "dateup": "2024-05-07T18:30:00.000Z",
                // "description": "",
                // "amount": "1288",
                // "type": "Office",
                // "category": "Electricity",
                // "status": 0,
                // "purpose": "office electricity bill ",
                // "reson": "",
                // "bid": 2,
                // "uid": 0,
                // "partyName": "..",
                // "pid": 0,
                // "remark": "",
                // "catid": 1,
                // "addtype": "Office"
                rows.forEach((row, index) => 
                {
                    // console.log(`Row ${index}:`, row);
                    //INSERT INTO `transaction`(`id`, `sid`, `Amount`, `amountType`, `pmode`, `transaction`, `chequeNumber`, `chequesImage`, `addtype`, `category`, `landownerid`, `pid`, `partyName`, `date`, `dateup`, `defaultDate`, `track`, `status`, `lastUpdatedData`, `bid`, `uid`, `purpose`, `remark`, `description`, `serveNumber`) VALUES ('[value-1]','[value-2]','[value-3]','[value-4]','[value-5]','[value-6]','[value-7]','[value-8]','[value-9]','[value-10]','[value-11]','[value-12]','[value-13]','[value-14]','[value-15]','[value-16]','[value-17]','[value-18]','[value-19]','[value-20]','[value-21]','[value-22]','[value-23]','[value-24]','[value-25]')
                    connection.query("INSERT INTO `transaction`(`Amount`, `amountType`, `pmode`,`addtype`, `category`,`pid`,`partyName`, `date`, `dateup`, `defaultDate`, `track`,`bid`, `uid`, `purpose`,`description`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                [
                    row.amount,
                    'Debit',
                    'Bank Transfer',
                    row.addtype,
                    row.catid,
                    row.pid,
                    row.partyName,
                    row.date,
                    row.dateup,
                    row.date,
                    track,
                    bid,
                    uid,
                    row.purpose,
                    row.description,
                ],(err,officeInsert)=>
                {
                    if(err)
                    {
                        console.log(err)
                        return res.status(500).json({error:"Internal Server Error"})
                    }else
                    {
                        // return res.json({
                        //     data:rows,
                        //     message:"Added To Office Expense",
                        //     code:200
                        // });
                        console.log(officeInsert)
                    }
                })
                });
                // return res.json({
                //     data:rows,
                //     message:"Added To Office Expense",
                //     code:200
                // });
            }
        });
    });
}