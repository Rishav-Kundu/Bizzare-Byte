const db = require("../db");

const Event = {
    getAll: (callback) => {
        db.query("SELECT * FROM events ORDER BY date ASC", callback);
    },

    create: (data, callback) => {
        db.query("INSERT INTO events SET ?", data, callback);
    },

    delete: (id, callback) => {
        db.query("DELETE FROM events WHERE id = ?", [id], callback);
    }
};

module.exports = Event;
