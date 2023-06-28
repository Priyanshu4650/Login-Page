const mysql = require('mysql');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    insecureAuth: true
});

module.exports = db;
