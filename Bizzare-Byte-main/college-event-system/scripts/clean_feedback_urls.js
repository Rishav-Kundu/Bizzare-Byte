const db = require('../db');

const sql = "UPDATE feedback_forms SET form_url = REPLACE(REPLACE(form_url, '\\r', ''), '\\n', '')";

db.query(sql, (err, res) => {
  if (err) {
    console.error('Error cleaning feedback_forms:', err);
    process.exit(1);
  }
  console.log('Cleaned feedback_forms form_url values');
  db.end();
});
