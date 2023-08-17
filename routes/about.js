const express = require("express");
const router = express.Router();
const assert = require("assert");

// Render About Us page
router.get("/", (req, res) => {
  res.render("about-us");
});

module.exports = router; 