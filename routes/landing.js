const express = require("express");
const router = express.Router();
const assert = require("assert");

// Render Landing Home page
router.get("/", (req, res) => {
  res.render("landing");
});

// Login button to render login page
router.get("/login", function (req, res) {
  res.render("login");
});

///////////////////////////////////////////////////////route export////////////////////////////////////////////////////////
module.exports = router;