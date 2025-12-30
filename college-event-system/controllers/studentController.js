const db = require("../db");

/* =========================
   STUDENT DASHBOARD
========================= */
exports.dashboard = (req, res) => {
  res.render("student/dashboard");
};

/* =========================
   VIEW EVENTS (STUDENT)
========================= */
exports.viewEvents = (req, res) => {
  db.query("SELECT * FROM events ORDER BY date ASC", (err, events) => {
    if (err) {
      console.error(err);
      return res.send("Error loading events");
    }

    // derive distinct categories from events (non-empty) and include default tags
    const found = Array.from(new Set(events.map(e => (e.category || '').toString().trim()).filter(s => s)));
    const defaults = ['Technical', 'Cultural', 'Sports', 'Academic'];
    // Merge defaults with found, preserving defaults order and avoiding duplicates (case-insensitive)
    const merged = [];
    const seen = new Set();
    defaults.forEach(d => { const key = d.toString().toLowerCase(); if (!seen.has(key)) { merged.push(d); seen.add(key); } });
    found.forEach(f => { const key = f.toString().toLowerCase(); if (!seen.has(key)) { merged.push(f); seen.add(key); } });
    const categories = merged;

    res.render("student/view-events", {
      events,
      categories,
      backUrl: "/student/dashboard"
    });
  });
};


/* =========================
   PARTICIPANT ZONE (EVENT LIST)
========================= */
exports.participantZone = (req, res) => {
  db.query("SELECT * FROM events", (err, events) => {
    if (err) {
      console.error(err);
      return res.send("Error loading events");
    }

    res.render("student/participant-zone", { events });
  });
};

/* =========================
   SUBMIT PARTICIPANT FORM
========================= */
exports.submitParticipant = (req, res) => {
  const { event_id, name, department, section, rollno, category } = req.body;

  db.query(
    `INSERT INTO participant_requests 
     (event_id, name, department, section, rollno, category)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [event_id, name, department, section, rollno, category],
    err => {
      if (err) {
        console.error(err);
        return res.send("Error submitting form");
      }
      res.redirect("/student/dashboard");
    }
  );
};



/* =========================
   VIEW GALLERY (STUDENT)
========================= */
exports.viewGallery = (req, res) => {
  db.query(
    `SELECT g.link, e.name AS event_name
     FROM gallery g
     JOIN events e ON g.event_id = e.id`,
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.send("Error loading gallery");
      }

      // Group links by event
      const grouped = {};
      rows.forEach(row => {
        if (!grouped[row.event_name]) {
          grouped[row.event_name] = [];
        }
        grouped[row.event_name].push(row.link);
      });

      const gallery = Object.keys(grouped).map(event => ({
        event_name: event,
        links: grouped[event]
      }));

      res.render("student/gallery", { gallery });
    }
  );
};
/* =========================
   PARTICIPANT FORM PAGE
========================= */
exports.participantFormPage = (req, res) => {
  const eventId = req.query.event_id;

  if (!eventId) {
    return res.redirect("/student/participant-zone");
  }

  db.query(
    "SELECT * FROM events WHERE id = ?",
    [eventId],
    (err, results) => {
      if (err || results.length === 0) {
        return res.send("Invalid event");
      }

      res.render("student/participant-form", {
        event: results[0]
      });
    }
  );
};

/* =========================
   GIVE FEEDBACK – EVENT LIST
========================= */
exports.giveFeedbackEvents = (req, res) => {
  db.query(
    `SELECT e.id, e.name, e.date, (f.form_url IS NOT NULL) AS has_form
     FROM events e
     LEFT JOIN feedback_forms f ON e.id = f.event_id
     ORDER BY e.date ASC`,
    (err, events) => {
    if (err) {
      console.error(err);
      return res.send("Error loading events");
    }

    // Convert has_form from 0/1 to boolean
    events = events.map(ev => ({ ...ev, has_form: !!ev.has_form }));
    res.render('student/feedback-events', { events });
  });
};

/* =========================
   GIVE FEEDBACK – BY EVENT
   If a form exists for the event, redirect student to it.
   Otherwise show a friendly message.
========================= */
exports.giveFeedbackByEvent = (req, res) => {
  const eventId = req.params.eventId;

  db.query(
    "SELECT form_url FROM feedback_forms WHERE event_id = ?",
    [eventId],
    (err, rows) => {
      // If table does not exist, treat as no form uploaded
      if (err && err.code === 'ER_NO_SUCH_TABLE') {
        return db.query("SELECT id, name FROM events WHERE id = ?", [eventId], (err, ev) => {
          if (err || ev.length === 0) return res.send('Event not found');
          res.render('student/feedback-message', { event: ev[0] });
        });
      }

      if (err) {
        console.error(err);
        return res.send('Error');
      }

      if (rows.length === 0) {
        // No form uploaded yet
        db.query("SELECT id, name FROM events WHERE id = ?", [eventId], (err, ev) => {
          if (err || ev.length === 0) return res.send('Event not found');
          res.render('student/feedback-message', { event: ev[0] });
        });
      } else {
        const url = rows[0].form_url;
        // Redirect student to the feedback form URL
        return res.redirect(url);
      }
    }
  );
};

/* =========================
   VIEW SINGLE EVENT (DETAILS)
========================= */
exports.viewEvent = (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM events WHERE id = ?", [id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.send('Error loading event');
    }

    if (!rows || rows.length === 0) return res.status(404).send('Event not found');

    const event = rows[0];
    res.render('student/view-event', { event, backUrl: '/student/view-events' });
  });
};

/* =========================
   PARTICIPANT LIST - Events (student view)
   Shows events which have accepted participants
========================= */
exports.participantEventList = (req, res) => {
  const sql = `SELECT e.id, e.name, e.date, COUNT(p.id) AS participant_count
               FROM events e
               JOIN participants p ON e.id = p.event_id
               GROUP BY e.id
               ORDER BY e.date ASC`;

  db.query(sql, (err, events) => {
    if (err) {
      console.error(err);
      return res.send('Error loading events');
    }

    res.render('student/participant-events', { events, backUrl: '/student/dashboard' });
  });
};

/* =========================
   PARTICIPANT LIST - By Event
========================= */
exports.participantListByEvent = (req, res) => {
  const eventId = req.params.eventId;

  db.query('SELECT id, name, date FROM events WHERE id = ?', [eventId], (err, evRows) => {
    if (err) { console.error(err); return res.send('Error'); }
    if (!evRows || evRows.length === 0) return res.status(404).send('Event not found');

    db.query('SELECT id, name, department, section, rollno, category FROM participants WHERE event_id = ? ORDER BY name ASC', [eventId], (err, participants) => {
      if (err) { console.error(err); return res.send('Error loading participants'); }

      res.render('student/participant-list', {
        event: evRows[0],
        participants,
        backUrl: '/student/participants/events'
      });
    });
  });
};
