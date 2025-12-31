const db = require('../db');

const initSql = `
-- Create admin table
CREATE TABLE IF NOT EXISTS admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME,
  venue VARCHAR(255),
  description TEXT,
  budget DECIMAL(10,2),
  category VARCHAR(64),
  has_form BOOLEAN DEFAULT FALSE
);

-- Create organisers table
CREATE TABLE IF NOT EXISTS organisers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT,
  image_path VARCHAR(500),
  description TEXT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Create allowed_students table
CREATE TABLE IF NOT EXISTS allowed_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  roll_no VARCHAR(50)
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT,
  student_id INT,
  name VARCHAR(255),
  email VARCHAR(255),
  roll_no VARCHAR(50),
  attendance BOOLEAN DEFAULT FALSE,
  certificate_issued BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Create feedback_forms table
CREATE TABLE IF NOT EXISTS feedback_forms (
  event_id INT PRIMARY KEY,
  form_url TEXT,
  response_url TEXT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Insert default admin if not exists
INSERT IGNORE INTO admin (username, password) VALUES ('admin', 'admin123');
`;

db.query(initSql, (err) => {
  if (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }

  console.log('Database initialized successfully.');
  db.end();
});