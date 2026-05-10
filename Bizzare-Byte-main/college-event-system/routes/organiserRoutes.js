const express = require("express");
const router = express.Router();
const organiserController = require("../controllers/organiserController");

/* =========================
   ORGANISER LOGIN
========================= */
router.get("/login", organiserController.loginPage);
router.post("/login", organiserController.login);

/* =========================
   ORGANISER DASHBOARD
========================= */
router.get("/dashboard", organiserController.dashboard);

/* =========================
   POST ORGANISER NOTE
========================= */
router.post("/note", organiserController.postNote);

// Upload feedback form URL for the organiser's event
router.post("/upload-feedback", organiserController.uploadFeedback);

// Remove/clear uploaded feedback links (form / responses / both)
router.post('/remove-feedback', organiserController.removeFeedback);

/* =========================
   LOGOUT
========================= */
router.get("/logout", organiserController.logout);

module.exports = router;
