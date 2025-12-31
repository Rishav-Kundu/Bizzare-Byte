const db = require("../db");

/* =========================
   HOME / LANDING PAGE
========================= */
exports.homePage = (req, res) => {
  res.render("index");
};

/* =========================
   LOGIN SELECTION PAGE
========================= */
exports.loginPage = (req, res) => {
  res.render("login");
};

/* =========================
   ADMIN LOGIN PAGE
========================= */
exports.adminLoginPage = (req, res) => {
  res.render("admin-login", { error: null });
};

/* =========================
   ADMIN LOGIN LOGIC
========================= */
exports.adminLogin = (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM admin WHERE username = ? AND password = ?",
    [username, password],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.render("admin-login", {
          error: "Something went wrong"
        });
      }

      if (result.length === 0) {
        return res.render("admin-login", {
          error: "Invalid username or password"
        });
      }

      // Store admin session
      req.session.admin = true;
      req.session.adminId = result[0].id;

      res.redirect("/admin/dashboard");
    }
  );
};

/* =========================
   STUDENT LOGIN PAGE
========================= */
exports.studentLoginPage = (req, res) => {
  res.render("student-login", { error: null });
};

/* =========================
   STUDENT LOGIN LOGIC
========================= */
/* =========================
   STUDENT LOGIN LOGIC (RESTRICTED)
========================= */
exports.studentLogin = (req, res) => {
  const { name, regno } = req.body;

  if (!name || !regno) {
    return res.render("student-login", {
      error: "All fields are required"
    });
  }

  // Check allowed students (case-insensitive name)
  db.query(
    "SELECT * FROM allowed_students WHERE LOWER(name) = LOWER(?) AND regno = ?",
    [name, regno],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.render("student-login", {
          error: "Something went wrong"
        });
      }

      if (results.length === 0) {
        return res.render("student-login", {
          error: "You are not authorised to access this system"
        });
      }

      // Allowed student → create session
      req.session.student = {
        name,
        regno
      };

      res.redirect("/student/dashboard");
    }
  );
};
