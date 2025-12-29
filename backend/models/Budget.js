const db = require("../db");

const Budget = {
    add: (data, callback) => {
        db.query("INSERT INTO budget SET ?", data, callback);
    },

    getAll: (callback) => {
        db.query("SELECT * FROM budget", callback);
    }
};

module.exports = Budget;
