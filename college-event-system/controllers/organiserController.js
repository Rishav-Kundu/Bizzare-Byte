const db = require("../db");

function requireOrganiserSession(req, res) {
  if (!req.session.organiser) {
    res.redirect("/organiser/login");
    return null;
  }

  return req.session.organiser;
}

function loadOrganiserEvent(eventId, callback) {
  db.query(
    "SELECT * FROM events WHERE id = ?",
    [eventId],
    (err, eventRows) => {
      if (err) {
        return callback(err);
      }

      if (!eventRows || eventRows.length === 0) {
        return callback(new Error("Event not found"));
      }

      callback(null, eventRows[0]);
    }
  );
}

function loadOrganiserMessages(eventId, callback) {
  db.query(
    "SELECT message FROM organiser_messages WHERE event_id = ?",
    [eventId],
    (err, messages) => {
      if (err) {
        return callback(err);
      }

      callback(null, messages || []);
    }
  );
}

function loadFeedbackLinks(eventId, callback) {
  db.query(
    "SELECT form_url, response_url FROM feedback_forms WHERE event_id = ?",
    [eventId],
    (err, rows) => {
      if (err) {
        if (err.code === "ER_NO_SUCH_TABLE") {
          return callback(null, null);
        }

        return callback(err);
      }

      if (!rows || rows.length === 0) {
        return callback(null, null);
      }

      callback(null, {
        form_url: rows[0].form_url,
        response_url: rows[0].response_url,
      });
    }
  );
}

function loadCurrentNote(eventId, regno, callback) {
  db.query(
    "SELECT notes FROM organisers WHERE event_id = ? AND regno = ? LIMIT 1",
    [eventId, regno],
    (err, rows) => {
      if (err) {
        return callback(err);
      }

      callback(null, rows && rows.length ? rows[0].notes : null);
    }
  );
}

/* =========================
   LOGIN PAGE
========================= */
exports.loginPage = (req, res) => {
  db.query("SELECT id, name FROM events", (err, events) => {
    if (err) return res.send("Error loading events");
    res.render("organiser/login", { events, error: null });
  });
};

/* =========================
   LOGIN LOGIC
========================= */
exports.login = (req, res) => {
  const { name, regno, event_id, passkey } = req.body;

  db.query(
    "SELECT * FROM events WHERE id = ? AND passkey = ?",
    [event_id, passkey],
    (err, events) => {
      if (err || events.length === 0) {
        return res.render("organiser/login", {
          events: [],
          error: "Invalid event or passkey"
        });
      }

      // Save organiser session
      req.session.organiser = {
        name,
        regno,
        event_id
      };

      // Store organiser (avoid duplicates optional)
      db.query(
        "INSERT INTO organisers (event_id, name, regno) VALUES (?, ?, ?)",
        [event_id, name, regno]
      );

      res.redirect("/organiser/dashboard");
    }
  );
};

/* =========================
   DASHBOARD
========================= */
exports.dashboard = (req, res) => {
  const session = requireOrganiserSession(req, res);
  if (!session) {
    return;
  }

  loadOrganiserEvent(session.event_id, (err, event) => {
    if (err) {
      console.error(err);
      return res.send("Error loading organiser dashboard");
    }

    res.render("organiser/dashboard", {
      event,
      msg: req.query.msg || null,
    });
  });
};

/* =========================
   EVENT BUDGET PAGE
========================= */
exports.budgetPage = (req, res) => {
  const session = requireOrganiserSession(req, res);
  if (!session) {
    return;
  }

  loadOrganiserEvent(session.event_id, (err, event) => {
    if (err) {
      console.error(err);
      return res.send("Error loading budget page");
    }

    res.render("organiser/budget", {
      event,
      msg: req.query.msg || null,
    });
  });
};

/* =========================
   ADMIN MESSAGES PAGE
========================= */
exports.messagesPage = (req, res) => {
  const session = requireOrganiserSession(req, res);
  if (!session) {
    return;
  }

  loadOrganiserEvent(session.event_id, (err, event) => {
    if (err) {
      console.error(err);
      return res.send("Error loading messages page");
    }

    loadOrganiserMessages(session.event_id, (messagesErr, messages) => {
      if (messagesErr) {
        console.error(messagesErr);
        return res.send("Error loading messages");
      }

      res.render("organiser/messages", {
        event,
        messages,
        msg: req.query.msg || null,
      });
    });
  });
};

/* =========================
   POST NOTES PAGE
========================= */
exports.notesPage = (req, res) => {
  const session = requireOrganiserSession(req, res);
  if (!session) {
    return;
  }

  loadOrganiserEvent(session.event_id, (err, event) => {
    if (err) {
      console.error(err);
      return res.send("Error loading notes page");
    }

    loadCurrentNote(session.event_id, session.regno, (noteErr, note) => {
      if (noteErr) {
        console.error(noteErr);
        return res.send("Error loading notes");
      }

      res.render("organiser/notes", {
        event,
        currentNote: note || "",
        msg: req.query.msg || null,
      });
    });
  });
};

/* =========================
   UPLOAD FEEDBACK PAGE
========================= */
exports.uploadFeedbackPage = (req, res) => {
  const session = requireOrganiserSession(req, res);
  if (!session) {
    return;
  }

  loadOrganiserEvent(session.event_id, (err, event) => {
    if (err) {
      console.error(err);
      return res.send("Error loading feedback page");
    }

    loadFeedbackLinks(session.event_id, (feedbackErr, feedback) => {
      if (feedbackErr) {
        console.error(feedbackErr);
        return res.send("Error loading feedback links");
      }

      res.render("organiser/upload-feedback", {
        event,
        feedback,
        msg: req.query.msg || null,
      });
    });
  });
};

/* =========================
   CURRENT FEEDBACK LINKS PAGE
========================= */
exports.feedbackLinksPage = (req, res) => {
  const session = requireOrganiserSession(req, res);
  if (!session) {
    return;
  }

  loadOrganiserEvent(session.event_id, (err, event) => {
    if (err) {
      console.error(err);
      return res.send("Error loading feedback links page");
    }

    loadFeedbackLinks(session.event_id, (feedbackErr, feedback) => {
      if (feedbackErr) {
        console.error(feedbackErr);
        return res.send("Error loading feedback links");
      }

      res.render("organiser/feedback-links", {
        event,
        feedback,
        msg: req.query.msg || null,
      });
    });
  });
};

/* =========================
   POST NOTE
========================= */
exports.postNote = (req, res) => {
  const session = requireOrganiserSession(req, res);
  if (!session) {
    return;
  }

  const { note } = req.body;

  db.query(
    "UPDATE organisers SET notes = ? WHERE event_id = ? AND regno = ?",
    [note, session.event_id, session.regno],
    () => res.redirect("/organiser/notes?msg=" + encodeURIComponent("Note saved successfully"))
  );
};

/* =========================
  UPLOAD FEEDBACK FORM URL
  (stores a feedback form URL per event)
========================= */
exports.uploadFeedback = (req, res) => {
  const session = requireOrganiserSession(req, res);
  if (!session) {
    return;
  }

  const { event_id } = session;
  const { form_url } = req.body;

  if (!form_url) return res.redirect('/organiser/upload-feedback?msg=' + encodeURIComponent('Please enter a feedback form URL'));

  // Clean input (trim and remove newlines) to prevent stored broken URLs
  const cleanUrl = (s) => (s || '').toString().trim().replace(/[\r\n]+/g, '');
  const cleanedFormUrl = cleanUrl(form_url);

  // Ensure table exists (include response_url)
  db.query(
    `CREATE TABLE IF NOT EXISTS feedback_forms (
      event_id INT PRIMARY KEY,
      form_url TEXT,
      response_url TEXT
    )`,
    (err) => {
      if (err) {
        console.error(err);
        return res.send('Error preparing DB');
      }

      // Accept any response URL (or empty). Clean before storing.
      const response_url = cleanUrl(req.body.response_url) || null;

      db.query(
        `INSERT INTO feedback_forms (event_id, form_url, response_url) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE form_url = VALUES(form_url), response_url = VALUES(response_url)`,
        [event_id, cleanedFormUrl, response_url],
        (err) => {
          if (err) {
            console.error(err);
          }
          res.redirect('/organiser/feedback-links?msg=' + encodeURIComponent('Feedback form saved successfully'));
        }
      );
    }
  );
};

/* =========================
   REMOVE FEEDBACK LINKS
========================= */
exports.removeFeedback = (req, res) => {
  const session = requireOrganiserSession(req, res);
  if (!session) {
    return;
  }

  const { event_id } = session;
  const { action } = req.body; // 'form' | 'response' | 'both'

  if (!action) return res.redirect('/organiser/feedback-links');

  // Ensure table exists
  db.query(`CREATE TABLE IF NOT EXISTS feedback_forms (
    event_id INT PRIMARY KEY,
    form_url TEXT,
    response_url TEXT
  )`, (err) => {
    if (err) {
      console.error('Error ensuring feedback_forms table:', err);
      return res.redirect('/organiser/dashboard?msg=' + encodeURIComponent('Error clearing feedback links'));
    }

    let sql, params;
    if (action === 'form') {
      sql = 'UPDATE feedback_forms SET form_url = NULL WHERE event_id = ?';
      params = [event_id];
    } else if (action === 'response') {
      sql = 'UPDATE feedback_forms SET response_url = NULL WHERE event_id = ?';
      params = [event_id];
    } else {
      sql = 'UPDATE feedback_forms SET form_url = NULL, response_url = NULL WHERE event_id = ?';
      params = [event_id];
    }

    db.query(sql, params, (err) => {
      if (err) {
        console.error('Error clearing feedback links:', err);
        return res.redirect('/organiser/dashboard?msg=' + encodeURIComponent('Error clearing feedback links'));
      }

      // If row doesn't exist, ensure no dangling row: insert a row with nulls so subsequent flows behave
      db.query('SELECT event_id FROM feedback_forms WHERE event_id = ?', [event_id], (err, rows) => {
        if (!err && rows.length === 0) {
          db.query('INSERT INTO feedback_forms (event_id, form_url, response_url) VALUES (?, NULL, NULL)', [event_id]);
        }
        return res.redirect('/organiser/feedback-links?msg=' + encodeURIComponent('Feedback links updated'));
      });
    });
  });
};

/* =========================
   LOGOUT
========================= */
exports.logout = (req, res) => {
  req.session.organiser = null;
  res.redirect("/");
};
