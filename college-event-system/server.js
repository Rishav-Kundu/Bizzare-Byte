const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// DB connection (DO NOT remove – needed to initialize DB)
require("./db");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "college_event_secret",
    resave: false,
    saveUninitialized: true,
  })
);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes/authRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/student", require("./routes/studentRoutes"));
app.use("/organiser", require("./routes/organiserRoutes"));

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// Home
app.get("/", (req, res) => {
  res.render("index");
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});
