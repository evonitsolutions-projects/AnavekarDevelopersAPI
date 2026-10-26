const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const branch = require("./src/branch");
const employee = require("./src/employee");
const customer = require("./src/customer");
const vendor = require("./src/vendor");
const agents = require("./src/agents");
const project = require("./src/project");
const login = require("./src/login");
const plot = require("./src/plotasign");
const payment = require("./src/payment");
const balancesheet = require("./src/expense.js");
const dbObj = require("./src/db.js");
const addCheque = require('./src/cheques.js');
const saleplot =require('./src/saleplot.js');
const landowner =require('./src/landowner.js');
const formCharge=require('./src/formcharge.js');
const statement=require('./src/statement.js');
const plotbook=require('./src/plotbook.js');

const path = require("path");
var fs = require("fs");
var https = require("https");
var request = require("request");
const app = express();
const db= dbObj(app)
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use("/public/customer", express.static("public/customer"));
app.use("/public/employee", express.static("public/employee"));
app.use("/public/vendor", express.static("public/vendor"));
app.use("/public/agent", express.static("public/agent"));
app.use("/public/project", express.static("public/project"));
app.use("/public/plots", express.static("public/plots"));
app.use("/public/saleplot", express.static("public/saleplot"));
app.use("/public/cheques", express.static("public/cheques"));


const PORT = 5000;
app.listen(PORT, () => {
  console.log("server is running");
});

branch(app, db);
employee(app, db);
customer(app, db);
addCheque(app, db)
vendor(app, db);
agents(app, db);
project(app, db);
login(app, db);
plot(app, db);
payment(app, db);
balancesheet(app, db);
saleplot(app, db);
plotbook(app, db);
landowner(app, db);
formCharge(app,db);
statement(app,db);
// table plotsale
//plotsale status 1 is completed emi all payment details
//plotsale status 0 means payment pending of emi
//paymenttype 1 means emi module
//paymenttype 0 means fulltime payment

//table plots
//res means plot salled
//res 0 means plots available

//1 is booked plots
//2 is available plots
//'' is All plots
