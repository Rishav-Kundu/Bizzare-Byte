const express = require("express");
const router = express.Router();
const admin = require("../controllers/adminController");

router.post("/add-note", admin.addNote);
router.post("/add-budget", admin.addBudget);

module.exports = router;
