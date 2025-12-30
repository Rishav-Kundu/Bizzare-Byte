const db = require("../db");

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
  if (!req.session.organiser) {
    return res.redirect("/organiser/login");
  }

  const { event_id } = req.session.organiser;

  db.query(
    "SELECT * FROM events WHERE id = ?",
    [event_id],
    (err, event) => {
      if (err) return res.send("Error");

      db.query(
        "SELECT message FROM organiser_messages WHERE event_id = ?",
        [event_id],
        (err, messages) => {
          // also load any uploaded feedback form info for this event
          db.query(
            "SELECT form_url, response_url FROM feedback_forms WHERE event_id = ?",
            [event_id],
            (err, formRows) => {
              let feedback = null;
              if (!err && formRows && formRows.length) {
                feedback = {
                  form_url: formRows[0].form_url,
                  response_url: formRows[0].response_url
                };
              }

              res.render("organiser/dashboard", {
                event: event[0],
                messages,
                msg: req.query.msg || null,
                feedback
              });
            }
          );
        }
      );
    }
  );
};

/* =========================
   POST NOTE
========================= */
exports.postNote = (req, res) => {
  const { note } = req.body;
  const { event_id } = req.session.organiser;

  db.query(
    "UPDATE organisers SET notes = ? WHERE event_id = ? AND regno = ?",
    [note, event_id, req.session.organiser.regno],
    () => res.redirect("/organiser/dashboard")
  );
};

/* =========================
  UPLOAD FEEDBACK FORM URL
  (stores a feedback form URL per event)
========================= */
exports.uploadFeedback = (req, res) => {
  if (!req.session.organiser) return res.redirect('/organiser/login');
  const { event_id } = req.session.organiser;
  const { form_url } = req.body;

  if (!form_url) return res.redirect('/organiser/dashboard');

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
          res.redirect('/organiser/dashboard');
        }
      );
    }
  );
};

/* =========================
   REMOVE FEEDBACK LINKS
========================= */
exports.removeFeedback = (req, res) => {
  if (!req.session.organiser) return res.redirect('/organiser/login');
  const { event_id } = req.session.organiser;
  const { action } = req.body; // 'form' | 'response' | 'both'

  if (!action) return res.redirect('/organiser/dashboard');

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
        return res.redirect('/organiser/dashboard?msg=' + encodeURIComponent('Feedback links updated'));
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
