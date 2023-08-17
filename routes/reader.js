const express = require("express");
const router = express.Router();
const assert = require("assert");

//Get request for settings page template
router.get("/settings", (req, res) => {
  res.render("settings");
});

//get request for the create-new-recipe page for an article
router.get("/create-new-recipe", (req, res) => {
  res.render("create-new-recipe");
});

//get request for the create-new-recipe page for an article
router.get("/profile", (req, res) => {
  res.render("profile");
});

router.get("/about-us", (req, res) => {
  res.render("about-us");
});

module.exports = router;