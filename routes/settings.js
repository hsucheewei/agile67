const express = require("express");
const router = express.Router();
const assert = require("assert");

// Render Settings page
router.get("/", (req, res) => {
  res.render("settings");
});

module.exports = router; 