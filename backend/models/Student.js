const db = require("../db");

const Student = {
    login: (name, reg, callback) => {
        db.query(
            "SELECT * FROM students WHERE name = ? AND registration = ?",
            [name, reg],
            callback
        );
    },

    registerIfNew: (data, callback) => {
        db.query("INSERT INTO students SET ?", data, callback);
    }
};

module.exports = Student;
