const db = require("../db");

const Participant = {
    register: (data, callback) => {
        db.query("INSERT INTO participants SET ?", data, callback);
    },

    getByEventId: (id, callback) => {
        db.query("SELECT * FROM participants WHERE event_id = ?", [id], callback);
    }
};

module.exports = Participant;
