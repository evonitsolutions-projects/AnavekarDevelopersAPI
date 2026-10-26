const path = require("path");
const multer = require("multer");
module.exports = function (app, connection) {
  const upload = multer();
  // This is to handle form data parsing
  app.use(upload.any());
  app.post("/submitlanddata", (req, res) => 
  {
    const { uid, name, mobile, address, branch, pid,servey,serveyArray } = req.body;
    const date = new Date();
    connection.query("SELECT * FROM landowner WHERE mobile = ?", [mobile], (err, rows) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        if (rows.length > 0) {
          // return res.status(200).json({ error: "Mobile number already exists" });
          return res.json({
            // data: result,
            code: 201,
          });
        } else {
          connection.query("INSERT INTO `landowner`(`name`, `mobile`, `address`, `bid`, `pid`, `regdate`, `dateup`,`servey`) VALUES(?,?,?,?,?,?,?,?)",
            [
              name,
              mobile,
              address,
              branch,
              pid,
              date,
              date,
              serveyArray,
            ], (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
              } else {
                return res.json({
                  data: "done",
                  code: 200,
                });
              }
            });
        }
      }
    });
  });

  app.post("/landownerList", (req, res) => {
    const bid = parseInt(req.body.bid);
    if (isNaN(bid)) {
      return res.json({
        code: 201,
      });
    }
    let query = "";
    if (bid === 0 || !bid) {
      query = "SELECT `landowner`.*,`branch`.`brandName`,`project`.`pname` FROM `landowner`,`branch`,`project` WHERE `landowner`.`bid`=`branch`.`id` AND `landowner`.`pid`=`project`.`pid`";
    } else {
      query = "SELECT `landowner`.*,`branch`.`brandName`,`project`.`pname` FROM `landowner`,`branch`,`project` WHERE `landowner`.`bid`=`branch`.`id` AND `landowner`.`pid`=`project`.`pid` AND `landowner`.`bid`=?";
    }
    connection.query(query, [bid], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        if (rows.length > 0) {
          return res.json({
            data: rows,
            code: 200,
          });
        } else {
          return res.json({
            code: 201,
          });
        }
      }
    });
  });

  app.post("/landownerudate", (req, res) => {
    const { id, uid, name, mobile, address, branch, pid,servey,serveyArray } = req.body;
    const date = new Date();
    // console.log(req.body);

    connection.query(
      "SELECT * FROM landowner WHERE mobile = ? AND id != ?",
      [mobile, id],
      (err, rows) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal server error" });
        } else {
          if (rows.length > 0) {
            // return res.status(201).json("Mobile number already exists");
            return res.json({
              // data: result,
              code: 201,
            });
          } else {
            let query =
              "UPDATE `landowner` SET `name`=?, `mobile`=?, `bid`=?, `pid`=?, `address`=?, `dateup`=?, `servey`=?";
            let queryParams = [
              name,
              mobile,
              branch,
              pid,
              address,
              date,
              serveyArray,
            ];
            query += " WHERE `id`=?";
            queryParams.push(id);
            connection.query(query, queryParams, (err, result) => {
              if (err) {
                console.error("Error executing UPDATE query: ", err);
                return res.status(500).json({ error: "Internal server error" });
              } else {
                if (result.affectedRows === 0) {
                  return res.status(404).json({ error: "Customer not found" });
                }
                console.log("Land Owner updated successfully:", result);
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


  app.post("/ownerPaymentList", (req, res) => {
    const bid = parseInt(req.body.bid);
    if (isNaN(bid)) {
      return res.json({
        code: 201,
      });
    }
    let query = "";
    if (bid === 0 || !bid) 
    {
      query = "SELECT `transaction`.*,`branch`.`brandName`,`project`.`pname`,`landowner`.`name`,`landowner`.`pid` FROM `transaction`,`landowner`,`branch`,`project` WHERE `landowner`.`bid`=`branch`.`id` AND `transaction`.`landownerid`=`landowner`.`id` AND `landowner`.`pid`=`project`.`pid`";
    } else {
      query = "SELECT `transaction`.*,`branch`.`brandName`,`project`.`pname`,`landowner`.`name`,`landowner`.`pid` FROM `transaction`,`landowner`,`branch`,`project` WHERE `landowner`.`bid`=`branch`.`id` AND `transaction`.`landownerid`=`landowner`.`id` AND `landowner`.`pid`=`project`.`pid` AND `transaction`.`bid`=?";
    }
    connection.query(query, [bid], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        if (rows.length > 0) {
          return res.json({
            data: rows,
            code: 200,
          });
        } else {
          return res.json({
            code: 201,
          });
        }
      }
    });
  });

  app.post("/landownerPayment", (req, res) => {
    const { uid, ownerid, date, dis, amount, branch } = req.body;
    const date1 = new Date();
    connection.query("INSERT INTO `ownerpayment`(`ownerid`, `dis`, `amount`, `date`, `dateup`, `uid`, `bid`) VALUES (?,?,?,?,?,?,?)",
      [
        ownerid,
        dis,
        amount,
        date1,
        date1,
        uid,
        branch,
      ], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal server error" });
        } else {
          return res.json({
            data: "done",
            code: 200,
          });
        }
      });
  })

  app.post("/ownerListBySearch", (req, res) => {
    // const {uid,name,mobile,address,branch,pid}=req.body;
    const date = new Date();
    // console.log(req.body);
    const bid = parseInt(req.body.bid);
    const searchTerm = req.body.searchTerm;
    if (searchTerm.trim() === "" || isNaN(bid)) {
      return res.json({
        code: 201,
      });
    }
    let query = "";
    if (bid === 0 || !bid) {
      query = "SELECT * FROM landowner WHERE name LIKE ?";
    } else {
      query = "SELECT * FROM landowner WHERE name LIKE ? AND bid = ?";
    }
    connection.query(query, [`%${searchTerm}%`, bid], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        if (rows.length > 0) {
          return res.json({
            data: rows,
            code: 200,
          });
        } else {
          return res.json({
            code: 201,
          });
        }
      }
    });
  })


  app.post("/landownerPaymentUpdate", (req, res) => {
    const { upid, ownerid, uid, date, dis, amount, branch } = req.body;
    const date1 = new Date();
    // `ownerid`, `dis`, `amount`, `date`, `dateup`, `uid`, `bid`

    let query = "UPDATE `ownerpayment` SET `ownerid`=?, `dis`=?, `amount`=?, `date`=?, `dateup`=?, `uid`=?,`bid`=?";
    let queryParams = [
      ownerid,
      dis,
      amount,
      date,
      date1,
      uid,
      branch
    ];
    query += " WHERE `id`=?";
    queryParams.push(upid);
    connection.query(query, queryParams, (err, result) => {
      if (err) {
        console.error("Error executing UPDATE query: ", err);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Customer not found" });
        }
        console.log("Land Owner updated successfully:", result);
        return res.json({
          data: result,
          code: 200,
        });
      }
    });
  });

  app.post("/addbank", (req, res) => {
    const { bankid, category, bank, ifsc, name, acc, acctype, center } = req.body;
    const date = new Date();
    connection.query("INSERT INTO `bank`(`category`, `bank`, `ifsc`, `name`, `acc`, `type`, `center`, `date`, `dateup`) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        category,
        bank,
        ifsc,
        name,
        acc,
        acctype,
        center,
        date,
        date,
      ], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal server error" });
        } else {
          return res.json({
            data: "done",
            code: 200,
          });
        }
      });
  });

  app.post("/fetchBankdata", (req, res) => {
    console.log('working');
    const query = "SELECT * FROM bank";
    connection.query(query, (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        if (rows.length > 0) {
          return res.json({
            data: rows,
            code: 200,
          });
        } else {
          return res.json({
            code: 201,
          });
        }
      }
    });
  })

  app.post("/updateBank", (req, res) => {
    const { bankid, category, bank, ifsc, name, acc, acctype, center } = req.body;
    const date = new Date();
    let query = "UPDATE `bank` SET `category`=?, `bank`=?, `ifsc`=?, `name`=?, `acc`=?, `type`=?,`center`=?,`dateup`=?";
    let queryParams = [
      category,
      bank,
      ifsc,
      name,
      acc,
      acctype,
      center,
      date
    ];
    query += " WHERE `id`=?";
    queryParams.push(bankid);
    connection.query(query, queryParams, (err, result) => {
      if (err) {
        console.error("Error executing UPDATE query: ", err);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Customer not found" });
        }
        console.log("updated successfully:", result);
        return res.json({
          data: result,
          code: 200,
        });
      }
    });
  });


  app.post("/deleteBank", (req, res) => {
    const delid = parseInt(req.body.delid);
    let query = "";
    connection.query("Delete FROM `bank` WHERE `id`=?", [delid], (err, rows1) => {
      if (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal server error" });
      } else {
        return res.json({
          data: "Bank Deleted",
          code: 200,
        });
      }
    });
  });

  app.post("/addformcharge", (req, res) => {
    const { formid, description, charge, typedata } = req.body;
    const date = new Date();
    connection.query("INSERT INTO `formcharge`(`description`, `charge`,`typedata`) VALUES (?,?,?)",
      [
        description,
        charge,
        typedata
      ], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal server error" });
        } else {
          return res.json({
            data: "done",
            code: 200,
          });
        }
      });
  });

  app.post("/formchargedata", (req, res) => {
    const date = new Date();

    query = "SELECT * FROM formcharge";
    connection.query(query, (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        if (rows.length > 0) {
          return res.json({
            data: rows,
            code: 200,
          });
        } else {
          return res.json({
            code: 201,
          });
        }
      }
    });
  })

  app.post("/updateformcharge", (req, res) => {
    const { formid, description, charge, typedata } = req.body;
    const date = new Date();
    let query = "UPDATE `formcharge` SET `description`=?, `charge`=?,`typedata`=? ";
    let queryParams = [
      description,
      charge,
      typedata
    ];
    query += " WHERE `id`=?";
    queryParams.push(formid);
    connection.query(query, queryParams, (err, result) => {
      if (err) {
        console.error("Error executing UPDATE query: ", err);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Customer not found" });
        }
        console.log("updated successfully:", result);
        return res.json({
          data: result,
          code: 200,
        });
      }
    });
  });

  app.post("/formchargedelete", (req, res) => {
    const delid = parseInt(req.body.delid);
    let query = "";
    connection.query("Delete FROM `formcharge` WHERE `id`=?", [delid], (err, rows1) => {
      if (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal server error" });
      } else {
        return res.json({
          data: "Charges Deleted",
          code: 200,
        });
      }
    });
  });

  app.post("/landownerNameSearch", (req, res) => {
    const bid = parseInt(req.body.bid);
    const searchTerm = req.body.searchTerm;
    if (searchTerm.trim() === "" || isNaN(bid)) {
      return res.json({
        code: 201,
      });
    }
    let query = "";
    if (bid === 0 || !bid) {
      query = "SELECT `landowner`.*,`project`.`pname` FROM `landowner`,`project` WHERE  `landowner`.`pid`=`project`.`pid` AND `landowner`.`name` LIKE ?";
    } else {
      query = "SELECT `landowner`.*,`project`.`pname` FROM `landowner`,`project` WHERE `landowner`.`pid`=`project`.`pid` AND `landowner`.`name` LIKE ? AND `landowner`.`bid` = ?";
    }
    connection.query(query, [`%${searchTerm}%`, bid], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        if (rows.length > 0) {
          return res.json({
            data: rows,
            code: 200,
          });
        } else {
          return res.json({
            code: 201,
          });
        }
      }
    });
  });
}


