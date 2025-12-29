const Event = require("../models/event");

exports.getAllEvents = (req, res) => {
    Event.getAll((err, events) => {
        if (err) res.json({ success: false });
        else res.json(events);
    });
};
