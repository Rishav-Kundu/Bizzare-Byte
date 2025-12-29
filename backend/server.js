const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const organiserRoutes = require("./routes/organiserRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/organiser", organiserRoutes);
app.use("/api/events", eventRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
