const Student = require("../models/Student");
const Participant = require("../models/Participant");

exports.login = (req, res) => {
    const { name, registration } = req.body;

    Student.login(name, registration, (err, result) => {
        if (err) res.json({ success: false });

        if (result.length > 0) {
            res.json({ success: true, student: result[0] });
        } else {
            // Auto register new student
            Student.registerIfNew({ name, registration }, (err2) => {
                if (err2) res.json({ success: false });
                else res.json({ success: true, student: { name, registration } });
            });
        }
    });
};

exports.registerEvent = (req, res) => {
    Participant.register(req.body, (err) => {
        if (err) res.json({ success: false });
        else res.json({ success: true });
    });
};
