const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

/* =========================
   STUDENT DASHBOARD
========================= */
router.get("/dashboard", studentController.dashboard);

/* =========================
   VIEW EVENTS
========================= */
router.get("/view-events", studentController.viewEvents);

// Single event details
router.get('/view-event/:id', studentController.viewEvent);

// Participant lists: event selection and per-event list
router.get('/participants/events', studentController.participantEventList);
router.get('/participants/:eventId', studentController.participantListByEvent);

/* =========================
   PARTICIPANT ZONE (STEP 1)
   Event Selection
========================= */
router.get("/participant-zone", studentController.participantZone);

/* =========================
   PARTICIPANT FORM (STEP 2)
========================= */
router.get("/participant-form", studentController.participantFormPage);
router.post("/participant-form", studentController.submitParticipant);


/* =========================
   GALLERY
========================= */
router.get("/gallery", studentController.viewGallery);

// Give feedback: event list and event-specific flow
router.get("/give-feedback/events", studentController.giveFeedbackEvents);
router.get("/give-feedback/:eventId", studentController.giveFeedbackByEvent);

module.exports = router;