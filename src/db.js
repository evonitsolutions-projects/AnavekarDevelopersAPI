// const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
// const corsOptions={
//     origin:'*',
//     optionsSuccessStatus:200,
// }
module.exports = function (app) {
    // app.use(cors(corsOptions));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    const connection = mysql.createConnection({
        host: "localhost",
        user: "anavekar_backendserver_db",
        password: "98btp8ErVXcY7QQ4CcMV",
        database: "anavekar_backendserver_db",
    });

    connection.connect((err) => {
        if (err) {
            console.error("Failed Database Connection: " + err.stack);
            return;
        }
        console.log("Connected to the database " + connection.threadId);
    });

    return connection;
};
