const express = require("express");
const router = express.Router();
const student = require("../controllers/studentController");

router.post("/login", student.login);
router.post("/register-event", student.registerEvent);

module.exports = router;
