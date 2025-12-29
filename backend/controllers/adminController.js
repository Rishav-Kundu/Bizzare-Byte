const Event = require("../models/event");
const OrganiserNote = require("../models/OrganiserNote");
const Budget = require("../models/Budget");

// ------------------------
// ADD EVENT
// ------------------------
exports.addEvent = (req, res) => {
    const { title, date, description } = req.body;

    if (!title || !date || !description) {
        return res.json({ success: false, message: "Missing event fields" });
    }

    const data = { title, date, description };

    Event.create(data, (err) => {
        if (err) {
            console.error("Error adding event:", err);
            return res.json({ success: false });
        }

        res.json({ success: true });
    });
};

// ------------------------
// DELETE EVENT
// ------------------------
exports.deleteEvent = (req, res) => {
    const eventId = req.params.id;

    if (!eventId) {
        return res.json({ success: false, message: "Event ID required" });
    }

    Event.delete(eventId, (err) => {
        if (err) {
            console.error("Error deleting event:", err);
            return res.json({ success: false });
        }

        res.json({ success: true });
    });
};

// ------------------------
// ADD ORGANISER NOTE
// ------------------------
exports.addNote = (req, res) => {
    const { note, added_by } = req.body;

    if (!note || !added_by) {
        return res.json({ success: false, message: "Missing note fields" });
    }

    const data = { note, added_by };

    OrganiserNote.add(data, (err) => {
        if (err) {
            console.error("Error adding note:", err);
            return res.json({ success: false });
        }

        res.json({ success: true });
    });
};

// ------------------------
// ADD BUDGET ITEM
// ------------------------
exports.addBudget = (req, res) => {
    const { item, amount, added_by } = req.body;

    if (!item || !amount || !added_by) {
        return res.json({ success: false, message: "Missing budget fields" });
    }

    const data = { item, amount, added_by };

    Budget.add(data, (err) => {
        if (err) {
            console.error("Error adding budget:", err);
            return res.json({ success: false });
        }

        res.json({ success: true });
    });
};
