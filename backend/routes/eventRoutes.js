const express = require("express");
const router = express.Router();
const event = require("../controllers/eventController");

router.get("/all", event.getAllEvents);

module.exports = router;
