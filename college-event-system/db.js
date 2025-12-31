const mysql = require("mysql2");

// Railway provides MYSQL_URL automatically
const db = mysql.createConnection(process.env.MYSQL_URL);

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:");
    console.error(err.message);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

module.exports = db;
