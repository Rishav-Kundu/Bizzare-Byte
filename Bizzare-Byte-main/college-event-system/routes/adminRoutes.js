const express = require("express");
const router = express.Router();
const db = require("../db");
const adminController = require("../controllers/adminController");

// =========================
// ADMIN AUTH
// =========================

// Admin login page
router.get("/login", (req, res) => {
  res.render("admin-login");
});

// Admin login handler
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM admin WHERE username = ? AND password = ?";
  db.query(query, [username, password], (err, result) => {
    if (err) return res.send("Database error");

    if (result.length > 0) {
      req.session.admin = true;
      res.redirect("/admin/dashboard");
    } else {
      res.send("Invalid admin credentials");
    }
  });
});

// Admin dashboard
router.get("/dashboard", (req, res) => {
  if (!req.session.admin) return res.redirect("/admin/login");
  res.render("admin/dashboard");
});

// =========================
// CREATE EVENTS
// =========================

router.get("/create-event", (req, res) => {
  if (!req.session.admin) return res.redirect("/admin/login");

  db.query("SELECT * FROM events ORDER BY id DESC", (err, events) => {
    if (err) return res.send("Error loading events");
    res.render("admin/create-event", { events });
  });
});

router.post("/create-event", (req, res) => {
  if (!req.session.admin) return res.redirect("/admin/login");
  // Use controller to handle category and other fields
  return adminController.createEvent(req, res);
});

router.get("/delete-event/:id", (req, res) => {
  if (!req.session.admin) return res.redirect("/admin/login");

  db.query("DELETE FROM events WHERE id = ?", [req.params.id], () => {
    res.redirect("/admin/create-event");
  });
});

// =========================
// PARTICIPANTS – EVENT FLOW
// =========================

router.get(
  "/participants/events",
  adminController.participantEventList
);

router.get(
  "/participants/:eventId",
  adminController.manageParticipantsByEvent
);

router.get("/approve-participant/:id", adminController.approveParticipant);
router.get("/reject-participant/:id", adminController.rejectParticipant);
router.get("/delete-participant/:id", adminController.deleteParticipant);

// =========================
// ORGANISERS – EVENT FLOW
// =========================

router.get(
  "/organisers/events",
  adminController.organiserEventList
);

router.get(
  "/organisers/:eventId",
  adminController.manageOrganisersByEvent
);

// ✅ SEND MESSAGE (FIXED)
router.post(
  "/send-message",
  adminController.sendMessage
);

// ✅ UPDATE BUDGET (FIXED)
router.post("/update-budget", (req, res) => {
  if (!req.session.admin) return res.redirect("/admin/login");

  const { event_id, budget } = req.body;

  db.query(
    "UPDATE events SET budget = ? WHERE id = ?",
    [budget, event_id],
    () => {
      res.redirect(`/admin/organisers/${event_id}`);
    }
  );
});

// ✅ DELETE ORGANISER (FIXED)
router.get("/delete-organiser/:id", (req, res) => {
  if (!req.session.admin) return res.redirect("/admin/login");

  const organiserId = req.params.id;

  db.query(
    "SELECT event_id FROM organisers WHERE id = ?",
    [organiserId],
    (err, result) => {
      if (err || result.length === 0) {
        return res.send("Organiser not found");
      }

      const eventId = result[0].event_id;

      db.query(
        "DELETE FROM organisers WHERE id = ?",
        [organiserId],
        () => {
          res.redirect(`/admin/organisers/${eventId}`);
        }
      );
    }
  );
});

// =========================
// GALLERY
// =========================

router.get("/manage-gallery", (req, res) => {
  if (!req.session.admin) return res.redirect("/admin/login");

  const galleryQuery = `
    SELECT g.id, g.link, e.name AS event_name
    FROM gallery g
    JOIN events e ON g.event_id = e.id
  `;

  db.query(galleryQuery, (err, gallery) => {
    if (err) return res.send("Error loading gallery");

    db.query("SELECT id, name FROM events", (err, events) => {
      if (err) return res.send("Error loading events");

      res.render("admin/manage-gallery", { gallery, events });
    });
  });
});

router.post("/add-gallery", (req, res) => {
  if (!req.session.admin) return res.redirect("/admin/login");

  const { event_id, link } = req.body;

  db.query(
    "INSERT INTO gallery (event_id, link) VALUES (?, ?)",
    [event_id, link],
    () => res.redirect("/admin/manage-gallery")
  );
});

router.get("/delete-gallery/:id", (req, res) => {
  if (!req.session.admin) return res.redirect("/admin/login");

  db.query("DELETE FROM gallery WHERE id = ?", [req.params.id], () => {
    res.redirect("/admin/manage-gallery");
  });
});

// =========================
// MANAGE ALLOWED STUDENTS
// =========================

router.get("/manage-students", (req, res) => {
  if (!req.session.admin) return res.redirect("/admin/login");

  db.query("SELECT * FROM allowed_students", (err, students) => {
    if (err) return res.send("Error");
    res.render("admin/manage-students", { students });
  });
});

router.post("/add-student", (req, res) => {
  const { name, regno } = req.body;

  db.query(
    "INSERT INTO allowed_students (name, regno) VALUES (?, ?)",
    [name, regno],
    () => res.redirect("/admin/manage-students")
  );
});

router.get("/delete-student/:id", (req, res) => {
  db.query(
    "DELETE FROM allowed_students WHERE id = ?",
    [req.params.id],
    () => res.redirect("/admin/manage-students")
  );
});

// =========================
// LOGOUT
// =========================

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});
/* =========================
   ATTENDANCE – EVENT FLOW
========================= */

// Step 1: Event list for attendance
router.get(
  "/attendance/events",
  adminController.attendanceEventList
);

// Step 2: Attendance page for selected event
router.get(
  "/attendance/:eventId",
  adminController.attendanceByEvent
);

// Step 3: Mark attendance
router.post(
  "/attendance/mark",
  adminController.markAttendance
);


/* =========================
   CERTIFICATES – EVENT FLOW
========================= */

// Step 1: Event list for certificates
router.get(
  "/certificates/events",
  adminController.certificateEventList
);

// Step 2: Certificate list for selected event
router.get(
  "/certificates/:eventId",
  adminController.certificateByEvent
);

// Feedback pages for admin (event list + per-event view)
router.get(
  "/feedback/events",
  adminController.feedbackEventList
);

router.get(
  "/feedback/:eventId",
  adminController.feedbackByEvent
);

// Generate certificate PDF for a participant
router.get(
  "/certificates/generate/:eventId/:participantId",
  adminController.generateCertificate
);

// Remove participant from certificate list (marks not eligible)
router.get(
  "/certificates/remove/:eventId/:participantId",
  adminController.removeCertificate
);

module.exports = router;