const multer = require('multer');
const fs = require('fs');
const path = require('path');

module.exports = function (app, connection) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/saleplot');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  const upload = multer({ storage });
    app.post('/saleplotSaledone', upload.fields([{ name: 'agreement', maxCount: 1 }, { name: 'saledeed', maxCount: 1 }, { name: 'form1', maxCount: 1 },{ name: 'form2', maxCount: 1 },{ name: 'cheques' }]), (req, res) => 
    {
        console.log(req.body);
        console.log(req.files);
        // return res.json({
        //     data: "Plot Salled Successfully",
        //     code: 200,
        // });
        // return;
        const agreementFile = req.files?.['agreement']?.[0]?.path || "";
        const saledeedpath = req.files?.['saledeed']?.[0]?.path || "";
        const form1 = req.files?.['form1']?.[0]?.path || "";
        const form2 = req.files?.['form2']?.[0]?.path || "";
        const chequeFiles = req.files['cheques'];
        const chequeNumbers = JSON.parse(req.body.chequeNumber);
        const chequesImagePaths = chequeFiles?.length > 0 ? chequeFiles.map(file => file.path) : [];
        let plotamt=0;
        let paid=0;
        const track=2;
        const { cid ,saleType,cidJoint, pid ,bid, totalSquareFeet, totalAmount, pricepersp, paymentType, downPay, remainAmt, paymentMode, referredBy, refname,refid, date,cheque,trans,commision,referedName}=req.body;
        const regdate = new Date();
        const plotData = JSON.parse(req.body.plotData);
        let payType=parseInt(paymentType);
        let amountType="Credit";
        let AddType="Customer Payment";
        let status=0;
        if(payType==0)
        {
            paid=totalAmount;
            status=1;
        }else if(payType==1)
        {
            paid=downPay;
        }
        connection.query("INSERT INTO `plotsale`(`cid`,`pid`,`totalsf`,`totalamt`,`pricesf`,`paymentType`,`date`,`regdate`,`bid`,`agreement`,`saledeed`,`form1`,`form2`,`status`,`type`,`jointcid`)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
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
            // JSON.stringify(imagePaths),
            agreementFile,
            saledeedpath,
            form1,
            form2,
            status,
            saleType,
            cidJoint
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
                               console.log(result); 
                            }
                    });
                    connection.query("UPDATE `plots` SET `res`=1 WHERE `id`=?",[plot.id],(err,plotup)=>{
                        if(err)
                        {
                            console.error(err);
                            return res.status(500).json({ error: "Internal server error" });
                        }else
                        {
                            console.log(plotup);
                        }
                    });
                });
                // connection.query("INSERT INTO `transaction`(`sid`,`Amount`,`amountType`,`pmode`, `transaction`, `chequeNumber`,`chequesImage`,`addtype`,`date`,`dateup`, `defaultDate`,`bid`,`track`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
                //     [
                //         saleId,
                //         paid,
                //         amountType,
                //         pmode,
                //         trans,
                //         JSON.stringify(chequeNumbers),
                //         JSON.stringify(chequesImagePaths),
                //         AddType,
                //         date,
                //         regdate,
                //         regdate,
                //         bid,
                //         track
                //     ],
                //     (err,pay)=>{
                //         if(err)
                //         {
                //             console.log(err)
                //             return res.status(500).json({error:"Internal Server Error"});
                //         }else
                //         {

                //         }
                //     });
                // connection.query("INSERT INTO `payment`( `sid`, `totalamt`, `downpayment`, `remain`,`paid`,`pmode`, `cheque`,`chequeNumber`,`chequesImage`,`date`) VALUES(?,?,?,?,?,?,?,?,?,?)",
                // [
                //     saleId,
                //     totalAmount,
                //     downPay,
                //     remainAmt,
                //     paid,
                //     paymentMode,
                //     trans,
                //     JSON.stringify(chequeNumbers),
                //     JSON.stringify(chequesImagePaths),
                //     date
                // ],(err,pay)=>{
                //     if(err)
                //     {
                //         console.error(err);
                //         return res.status(500).json({ error: "Internal server error" });
                //     }else{
                //        console.log(pay); 
                //     }
                // });

                // if(referredBy !=4)
                // {
                    connection.query("INSERT INTO `referal`(`saleid`,`feferedName`) VALUES(?,?)",
                    [
                        saleId,
                        referedName,
                    ],(err,ref)=>{
                        if(err)
                        {
                            console.error(err);
                            return res.status(500).json({ error: "Internal server error" });
                        }else{
                        console.log(ref); 
                        }
                    });
                    return res.json({
                        data: "Plot Salled Successfully",
                        code: 200,
                    });
                // }else
                // {
                //     return res.json({
                //         data: "Plot Salled Successfully",
                //         code: 200,
                //     });
                // }
            }
        });
    });

    app.post('/payEMI', upload.fields([{ name: 'cheques' }]),(req, res) => 
    {
      console.log(req.body);
      console.log(req.files);
      const sid=parseInt(req.body.sid);
      const totalamt=parseFloat(req.body.totalamt); //total
      const remain=parseFloat(req.body.remain); // remain old
      const payEMI=parseFloat(req.body.paying); //emi
      const pending=parseFloat(req.body.pending); //last pending
      const paymentmode=req.body.pmode;
      const date=req.body.date;
      const cheque=req.body.cheque;
      const trans=req.body.trans;
      const chequeFiles = req.files['cheques'];
      const chequesImagePaths = chequeFiles?.length > 0 ? chequeFiles.map(file => file.path) : [];
      const chequeNumbers = JSON.parse(req.body.chequeNumber);
      // let detail='';
      // if(cheque=='')
      // {
      //    detail=trans; 
      // }

      connection.query("INSERT INTO `payment`(`sid`,`totalamt`,`remain`,`paid`,`pmode`,`cheque`,`chequeNumber`,`chequesImage`,`date`)VALUES(?,?,?,?,?,?,?,?,?)",
          [
              sid,
              totalamt,
              pending,
              payEMI,
              paymentmode,
              trans,
              JSON.stringify(chequeNumbers),
              JSON.stringify(chequesImagePaths),
              date
          ],(err,rows)=>{
              if(err)
              {
                  console.log(err);
                  return res.status(500).json({ error: "Internal server error" });
              }else
              {
                  if(pending==0)
                  {
                      connection.query("UPDATE plotsale SET status=1 WHERE id=?",[sid],(err,rows)=>{
                          if(err)
                          {
                              console.log(err);
                              return res.status(500).json({ error: "Internal server error" });
                          }else
                          {
                              return res.json({
                                  data: rows,
                                  code: 201,
                              });
                          }
                      });
                  }else
                  {
                      return res.json({
                          data: rows,
                          code: 200,
                      });
                  }
              }
          });
  });

    app.post("/saledeedsubmit", upload.single("agreement"), async (req, res) => 
    {
        console.log(req.body.sid);
        console.log(req.file.path);
        const sid=req.body.sid;
        const path=req.file.path;
        connection.query("UPDATE `plotsale` SET `saledeed`=? WHERE `id`=?",[path,sid],(err,rows)=>
            {
                if(err)
                {
                    return res.status(500).json({error:"Internal Server Error"});
                }else
                {
                    console.log(rows);
                    return res.json({
                        data:'Sale Deed IS Generated',
                        code:200
                    })
                }
            }
        )
    });

    app.post("/PlotShiftDetails", upload.none(), async (req, res) => 
    {
        const today = new Date().toISOString().split("T")[0]; 
        // console.log("Today's Date:", today); 
        console.log(req.body);
        const {sid,newRate,Newtotalamt,changedplotid,date,oldplotnum,pid}=req.body;
        // return;
        connection.query("UPDATE `plotsale` SET `totalamt`=?,`pricesf`=?,`dateup`=? WHERE `id`=?",
            [
                Newtotalamt,
                newRate,
                today,
                sid
            ],(err,rows)=>{
                if(err)
                {
                    return res.status(500).json({error:"Internal Server Error"});
                }else
                {
                    connection.query("UPDATE `saleplotdetails` SET `plotid`=?,`plotamt`=? WHERE `sid`=?",
                        [
                            changedplotid,
                            Newtotalamt,
                            sid
                        ],(err,rows)=>
                        {
                            if(err)
                            {
                                return res.status(500).json({error:"Internal Server Error"});
                            }else
                            {
                                console.log('working correct')

                                Promise.all([
                                    new Promise((resolve, reject) => {
                                        connection.query('UPDATE `plots` SET `res`=0 WHERE plotnum=? AND pid=?', [oldplotnum, pid], (err, r) => {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                console.log('Old plot updated');
                                                resolve(r);
                                            }
                                        });
                                    }),
                                    new Promise((resolve, reject) => {
                                        connection.query('UPDATE `plots` SET `res`=1 WHERE plotnum=? AND pid=?', [changedplotid, pid], (err, r) => {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                console.log('Changed plot updated');
                                                resolve(r);
                                            }
                                        });
                                    })
                                ])
                                .then(() => {
                                    console.log("Sale plot table updated");
                                    return res.json({
                                        data: 'Sale Shifted',
                                        code: 200
                                    });
                                })
                                .catch(err => {
                                    console.error("Error during plot update:", err);
                                    return res.status(500).json({ error: "Internal Server Error" });
                                });
                                
                                // connection.query('UPDATE `plots` SET `res`=0 WHERE plotnum=? AND pid=?',[oldplotnum,pid],(err,r)=>
                                // {
                                //     if(err)
                                //     {

                                //     }else
                                //     {
                                //         console.log('done');
                                //     }
                                // });
                                // connection.query('UPDATE `plots` SET `res`=1 WHERE plotnum=? AND pid=?',[changedplotid,pid],(err,r)=>
                                // {
                                //     if(err)
                                //     {

                                //     }else
                                //     {
                                //         console.log('done');
                                //     }
                                // });

                                // console.log("sale plot table updated");
                                // return res.json({
                                //     data:'Sale Shifted',
                                //     code:200
                                // })
                                // connection.query(`UPDATE plots
                                //                     SET res = CASE 
                                //                         WHEN plotnum = ? THEN 0  
                                //                         WHEN plotnum = ? THEN 1 
                                //                         ELSE res END  
                                //                     wHERE plotnum IN (?, ?) AND pid = ?`,[oldplotnum, changedplotid, oldplotnum, changedplotid,pid],(err,rows2)=>
                                //                     {
                                //                         if(err)
                                //                         {
                                //                             return res.status(500).json({error:"Internal Server Error"});
                                //                         }else
                                //                         {
                                //                             console.log(rows2.affectedRows > 0 ? "Sale Shifted" : "No rows updated")
                                                            // console.log("sale plot table updated");
                                                            // return res.json({
                                                            //     data:'Sale Shifted',
                                                            //     code:200
                                                            // })
                                //                         }
                                //                     })
                            }
                    })
                }
            })
        });
    }