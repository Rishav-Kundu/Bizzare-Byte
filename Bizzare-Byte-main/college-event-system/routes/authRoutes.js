const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/* =========================
   PUBLIC PAGES
========================= */

// Home page
router.get("/", authController.homePage);

// Login selection page
router.get("/login", authController.loginPage);

// View events without login
router.get("/view-events", (req, res) => {
  const db = require("../db");

  db.query("SELECT * FROM events ORDER BY date ASC", (err, events) => {
    if (err) {
      console.error(err);
      return res.send("Error loading events");
    }

    // reuse student view-events page
    res.render("student/view-events", {
      events,
      backUrl: "/"
    });
  });
});



/* =========================
   ADMIN AUTH
========================= */

// Admin login page
router.get("/admin/login", authController.adminLoginPage);

// Admin login logic
router.post("/admin/login", authController.adminLogin);

/* =========================
   STUDENT AUTH
========================= */

// Student login page
router.get("/student/login", authController.studentLoginPage);

// Student login logic
router.post("/student/login", authController.studentLogin);

module.exports = router;
