const db = require('../db');

// Check if column exists in information_schema for current database
const checkSql = `SELECT COUNT(*) AS cnt
  FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'events' AND column_name = 'category'`;

db.query(checkSql, (err, rows) => {
  if (err) {
    console.error('Error checking information_schema:', err);
    db.end();
    process.exit(1);
  }

  const exists = rows && rows[0] && rows[0].cnt > 0;
  if (exists) {
    console.log('Column `category` already exists on `events`. Nothing to do.');
    db.end();
    return;
  }

  const alter = `ALTER TABLE events ADD COLUMN category VARCHAR(64) NULL AFTER budget`;
  db.query(alter, (err) => {
    if (err) {
      console.error('Error running ALTER TABLE:', err);
      db.end();
      process.exit(1);
    }
    console.log('ALTER TABLE executed — column `category` added.');
    db.end();
  });
});
