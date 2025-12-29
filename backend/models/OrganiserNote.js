const db = require("../db");

const OrganiserNote = {
    add: (data, callback) => {
        db.query("INSERT INTO organiser_notes SET ?", data, callback);
    },

    getAll: (callback) => {
        db.query("SELECT * FROM organiser_notes", callback);
    }
};

module.exports = OrganiserNote;
