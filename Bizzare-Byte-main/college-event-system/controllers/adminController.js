const db = require("../db");

/* =========================
   ADMIN DASHBOARD
========================= */
exports.dashboard = (req, res) => {
  res.render("admin/dashboard");
};

/* =========================
   CREATE EVENT
========================= */
exports.createEventPage = (req, res) => {
  db.query("SELECT * FROM events", (err, events) => {
    if (err) {
      console.error(err);
      return res.send("Error loading events");
    }
    res.render("admin/create-event", { events });
  });
};

exports.createEvent = (req, res) => {
  const { name, date, description, passkey, budget, category } = req.body;

  db.query(
    "INSERT INTO events (name, date, description, passkey, budget, category) VALUES (?, ?, ?, ?, ?, ?)",
    [name, date, description, passkey, budget, category || null],
    (err) => {
      if (err) {
        console.error(err);
        return res.send("Error creating event");
      }
      res.redirect("/admin/create-event");
    }
  );
};

/* =========================
   MANAGE PARTICIPANTS
========================= */
exports.manageParticipants = (req, res) => {
  db.query(
    `SELECT pr.*, e.name AS event_name
     FROM participant_requests pr
     JOIN events e ON pr.event_id = e.id`,
    (err, requests) => {
      if (err) {
        console.error(err);
        return res.send("Error loading participants");
      }
      res.render("admin/manage-participants", { requests });
    }
  );
};

/* =========================
   APPROVE PARTICIPANT
========================= */
exports.approveParticipant = (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT * FROM participant_requests WHERE id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error('Error fetching participant request:', err);
        return res.redirect('/admin/participants/events');
      }

      if (!rows || rows.length === 0) {
        // Redirect back to events list with a message instead of plain text error
        return res.redirect('/admin/participants/events?msg=' + encodeURIComponent('Request not found or already processed'));
      }

      const p = rows[0];

      db.query(
        "INSERT INTO participants (event_id, name, department, section, rollno, category) VALUES (?, ?, ?, ?, ?, ?)",
        [p.event_id, p.name, p.department, p.section, p.rollno, p.category],
        (err) => {
          if (err) {
            console.error('Error inserting participant:', err);
            return res.redirect('/admin/participants/events?msg=' + encodeURIComponent('Error approving participant'));
          }

          db.query(
            "DELETE FROM participant_requests WHERE id = ?",
            [id],
            (delErr) => {
              if (delErr) console.error('Error deleting request after approve:', delErr);
              // Redirect to the participant list for this event if possible
              if (p.event_id) return res.redirect(`/admin/participants/${p.event_id}`);
              return res.redirect('/admin/participants/events');
            }
          );
        }
      );
    }
  );
};

/* =========================
   REJECT PARTICIPANT
========================= */
exports.rejectParticipant = (req, res) => {
  const id = req.params.id;
  db.query(
    "DELETE FROM participant_requests WHERE id = ?",
    [id],
    () => res.redirect("/admin/manage-participants")
  );
};

/* =========================
   MANAGE ORGANISERS
========================= */
exports.manageOrganisers = (req, res) => {
  db.query(
    `SELECT o.*, e.name AS event_name, e.budget
     FROM organisers o
     JOIN events e ON o.event_id = e.id`,
    (err, organisers) => {
      if (err) {
        console.error(err);
        return res.send("Error loading organisers");
      }
      res.render("admin/manage-organisers", { organisers });
    }
  );
};

/* =========================
   UPDATE BUDGET
========================= */
exports.updateBudget = (req, res) => {
  const { event_id, budget } = req.body;

  db.query(
    "UPDATE events SET budget = ? WHERE id = ?",
    [budget, event_id],
    () => res.redirect("/admin/manage-organisers")
  );
};

/* =========================
   SEND MESSAGE TO ORGANISERS
========================= */

exports.sendMessage = (req, res) => {
  const { event_id, message } = req.body;

  db.query(
    "INSERT INTO organiser_messages (event_id, message) VALUES (?, ?)",
    [event_id, message],
    () => {
      // Redirect back to SAME event page
      res.redirect(`/admin/organisers/${event_id}`);
    }
  );
};


/* =========================
   MANAGE GALLERY
========================= */
exports.manageGallery = (req, res) => {
  // get gallery links
  db.query(
    `SELECT g.id, g.link, e.name AS event_name
     FROM gallery g
     JOIN events e ON g.event_id = e.id`,
    (err, gallery) => {
      if (err) {
        console.error(err);
        return res.send("Error loading gallery");
      }

      // get events for dropdown
      db.query(
        "SELECT id, name FROM events",
        (err, events) => {
          if (err) {
            console.error(err);
            return res.send("Error loading events");
          }

          res.render("admin/manage-gallery", {
            gallery,
            events
          });
        }
      );
    }
  );
};


exports.addGalleryLink = (req, res) => {
  const { event_id, link } = req.body;

  db.query(
    "INSERT INTO gallery (event_id, link) VALUES (?, ?)",
    [event_id, link],
    () => res.redirect("/admin/manage-gallery")
  );
};

exports.deleteGalleryLink = (req, res) => {
  const id = req.params.id;

  db.query(
    "DELETE FROM gallery WHERE id = ?",
    [id],
    () => res.redirect("/admin/manage-gallery")
  );
};
/* =========================
   PARTICIPANT – EVENT LIST
========================= */
exports.participantEventList = (req, res) => {
  db.query(
    "SELECT id, name, date FROM events ORDER BY date ASC",
    (err, events) => {
      if (err) {
        console.error(err);
        return res.send("Error loading events");
      }

      res.render("admin/participant-events", { events });
    }
  );
};
/* =========================
   MANAGE PARTICIPANTS (BY EVENT)
========================= */
exports.manageParticipantsByEvent = (req, res) => {
  const eventId = req.params.eventId;

  db.query(
    "SELECT * FROM participant_requests WHERE event_id = ?",
    [eventId],
    (err, requests) => {
      if (err) {
        console.error(err);
        return res.send("Error loading participant requests");
      }

      db.query(
        "SELECT * FROM participants WHERE event_id = ?",
        [eventId],
        (err, approved) => {
          if (err) {
            console.error(err);
            return res.send("Error loading approved participants");
          }

          res.render("admin/manage-participants", {
            eventId,
            requests,
            approved
          });
        }
      );
    }
  );
};
/* =========================
   ORGANISER – EVENT LIST
========================= */
exports.organiserEventList = (req, res) => {
  db.query(
    "SELECT id, name FROM events ORDER BY name ASC",
    (err, events) => {
      if (err) {
        console.error(err);
        return res.send("Error loading events");
      }

      res.render("admin/organiser-events", { events });
    }
  );
};
/* =========================
   MANAGE ORGANISERS (BY EVENT)
========================= */
exports.manageOrganisersByEvent = (req, res) => {
  const eventId = req.params.eventId;

  db.query(
    "SELECT * FROM organisers WHERE event_id = ?",
    [eventId],
    (err, organisers) => {
      if (err) {
        console.error(err);
        return res.send("Error loading organisers");
      }

      db.query(
        "SELECT name, budget FROM events WHERE id = ?",
        [eventId],
        (err, event) => {
          if (err || event.length === 0) {
            return res.send("Event not found");
          }

          res.render("admin/manage-organisers", {
            eventId,
            event: event[0],
            organisers
          });
        }
      );
    }
  );
};
/* =========================
   DELETE APPROVED PARTICIPANT
========================= */
exports.deleteParticipant = (req, res) => {
  const participantId = req.params.id;
  const eventId = req.query.eventId;

  db.query(
    "DELETE FROM participants WHERE id = ?",
    [participantId],
    (err) => {
      if (err) {
        console.error(err);
        return res.send("Error deleting participant");
      }

      // If we know the event page, redirect back to that event's participants list
      if (eventId) return res.redirect(`/admin/participants/${eventId}`);

      // Fallback to previous page
      res.redirect("back");
    }
  );
};




/* =========================
   CERTIFICATES – EVENT LIST
========================= */
exports.certificateEventList = (req, res) => {
  db.query(
    "SELECT id, name, date FROM events ORDER BY date ASC",
    (err, events) => {
      if (err) {
        console.error(err);
        return res.send("Error loading events");
      }

      res.render("admin/certificate-events", { events });
    }
  );
};

/* =========================
   FEEDBACK – EVENT LIST (ADMIN)
========================= */
exports.feedbackEventList = (req, res) => {
  db.query(
    "SELECT id, name, date FROM events ORDER BY date ASC",
    (err, events) => {
      if (err) {
        console.error(err);
        return res.send("Error loading events");
      }

      res.render("admin/feedback-events", { events });
    }
  );
};

/* =========================
   FEEDBACK – BY EVENT (ADMIN)
========================= */
exports.feedbackByEvent = (req, res) => {
  const eventId = req.params.eventId;
  // Load event first so we can always render page even if feedback table has an issue
  db.query("SELECT id, name FROM events WHERE id = ?", [eventId], (err, ev) => {
    if (err || ev.length === 0) return res.send('Event not found');
    const event = ev[0];

    db.query("SELECT form_url, response_url FROM feedback_forms WHERE event_id = ?", [eventId], (err, rows) => {
      if (err) {
        // If table missing, or any other error, log and render page with no form
        console.error('feedback_forms query error:', err);
        return res.render('admin/feedback', { event, form_url: null, response_url: null, errorMessage: err.message });
      }

      const form_url = rows.length ? rows[0].form_url : null;
      const response_url = rows.length ? rows[0].response_url : null;

      res.render('admin/feedback', { event, form_url, response_url, errorMessage: null });
    });
  });
};

/* =========================
   CERTIFICATES – BY EVENT
========================= */
exports.certificateByEvent = (req, res) => {
  const eventId = req.params.eventId;

  db.query(
    `
      SELECT id, name, rollno
    FROM participants
    WHERE event_id = ?
      AND attendance = 'present'
    `,
    [eventId],
    (err, participants) => {
      if (err) {
        console.error(err);
        return res.send("Error loading certificate list");
      }

      db.query(
              "SELECT id, name FROM events WHERE id = ?",
        [eventId],
        (err, event) => {
          if (err || event.length === 0) {
            return res.send("Event not found");
          }

          res.render("admin/certificates", {
            event: event[0],
            participants
          });
        }
      );
    }
  );
};

      /* =========================
         GENERATE CERTIFICATE PDF
      ========================= */
      exports.generateCertificate = (req, res) => {
        const { eventId, participantId } = req.params;

        db.query(
          "SELECT id, name, date FROM events WHERE id = ?",
          [eventId],
          (err, events) => {
            if (err || events.length === 0) return res.send("Event not found");
            const event = events[0];

            db.query(
              "SELECT id, name, rollno FROM participants WHERE id = ? AND event_id = ? AND attendance = 'present'",
              [participantId, eventId],
              (err, parts) => {
                if (err || parts.length === 0) return res.send("Participant not found or not eligible");
                const p = parts[0];

                // lazy-require PDFKit so app still runs if package isn't installed yet
                const PDFDocument = require('pdfkit');

                const doc = new PDFDocument({ size: 'A4', margin: 50 });

                res.setHeader('Content-disposition', `attachment; filename=certificate-${p.name.replace(/\s+/g,'-')}.pdf`);
                res.setHeader('Content-type', 'application/pdf');

                doc.fontSize(20).text('Certificate of Participation', { align: 'center' });
                doc.moveDown(2);
                doc.fontSize(14).text(`This is to certify that`, { align: 'center' });
                doc.moveDown(1);
                doc.font('Times-Bold').fontSize(18).text(p.name, { align: 'center' });
                doc.moveDown(0.5);
                doc.font('Times-Roman').fontSize(12).text(`(Roll/Reg No: ${p.rollno || ''})`, { align: 'center' });
                doc.moveDown(1);
                doc.fontSize(14).text(`has participated in the event`, { align: 'center' });
                doc.moveDown(0.5);
                doc.font('Times-Bold').fontSize(16).text(event.name, { align: 'center' });
                doc.moveDown(3);
                doc.fontSize(12).text('Date: ' + (event.date ? new Date(event.date).toDateString() : ''), { align: 'right' });
                doc.moveDown(2);
                doc.text('__________________________', { align: 'right' });
                doc.text('Signature', { align: 'right' });

                doc.pipe(res);
                doc.end();
              }
            );
          }
        );
      };

      /* =========================
         REMOVE FROM CERTIFICATE LIST
         (marks attendance as not-present so entry won't show)
      ========================= */
      exports.removeCertificate = (req, res) => {
        const { eventId, participantId } = req.params;

        db.query(
          "UPDATE participants SET attendance = 'absent' WHERE id = ? AND event_id = ?",
          [participantId, eventId],
          (err) => {
            if (err) {
              console.error(err);
              return res.send('Error removing from certificate list');
            }
            res.redirect(`/admin/certificates/${eventId}`);
          }
        );
      };

/* =========================
   ATTENDANCE – EVENT LIST
========================= */
exports.attendanceEventList = (req, res) => {
  db.query(
    "SELECT id, name, date FROM events ORDER BY date ASC",
    (err, events) => {
      if (err) {
        console.error(err);
        return res.send("Error loading events");
      }

      res.render("admin/attendance-events", { events });
    }
  );
};

/* =========================
   ATTENDANCE – BY EVENT
========================= */
exports.attendanceByEvent = (req, res) => {
  const eventId = req.params.eventId;

  db.query(
    `
    SELECT id, name, rollno, attendance
    FROM participants
    WHERE event_id = ?
    `,
    [eventId],
    (err, participants) => {
      if (err) {
        console.error(err);
        return res.send("Error loading participants");
      }

      db.query(
        "SELECT id, name FROM events WHERE id = ?",
        [eventId],
        (err, event) => {
          if (err || event.length === 0) {
            return res.send("Event not found");
          }

          res.render("admin/attendance", {
            event: event[0],
            participants
          });
        }
      );
    }
  );
};


/* =========================
   MARK ATTENDANCE
========================= */
exports.markAttendance = (req, res) => {
  const { participant_id, attendance, event_id } = req.body;

  db.query(
    "UPDATE participants SET attendance = ? WHERE id = ?",
    [attendance, participant_id],
    () => {
      res.redirect(`/admin/attendance/${event_id}`);
    }
  );
};

