const db = require('../db');

const createSql = `
CREATE TABLE IF NOT EXISTS feedback_forms (
  event_id INT PRIMARY KEY,
  form_url TEXT,
  response_url TEXT
);
`;

db.query(createSql, (err) => {
  if (err) {
    console.error('Error creating feedback_forms table:', err);
    process.exit(1);
  }

  console.log('feedback_forms table created (or already existed).');
  db.end();
});
