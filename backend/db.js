const mysql = require("mysql2");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "bizzare_byte"
});

db.getConnection((err) => {
    if (err) {
        console.log("Database Connection Failed!", err);
    } else {
        console.log("Connected to MySQL Database");
    }
});

module.exports = db;
