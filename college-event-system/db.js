const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "admin123",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "college_event_system",
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
  connectTimeout: 10000,
});

db.connect((err) => {
  if (err) {
    console.error(
      "❌ MySQL connection failed:",
      err.message,
      "\nSet MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, and MYSQLPORT for Railway, or run a local MySQL server with database college_event_system."
    );
  } else {
    console.log(`✅ Connected to MySQL (${db.config.host}:${db.config.port}/${db.config.database})`);
  }
});

module.exports = db;
