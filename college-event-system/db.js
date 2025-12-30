const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",          // change if your MySQL username is different
  password: "Prometheus30$", // 🔴 put your MySQL password here
  database: "college_event_system"
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

module.exports = db;
