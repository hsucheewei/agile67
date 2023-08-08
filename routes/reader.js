const express = require("express");
const router = express.Router();
const assert = require("assert");

//reader homepage
router.get("/home", (req, res) => {
  res.render("reader-home", {
    img: "/images/sam-moghadam-khamseh-yxZSAjyToP4-unsplash.jpg",
  });
});

// Get request for recipe page template
router.get("/recipe", (req, res) => {
  const recipeId = req.query.id; // Extract the recipeId from query parameters (will prob need this later on)
  res.render("recipe");
});

//Get request for settings page template
router.get("/settings", (req, res) => {
  // Render the settings.ejs template
  res.render("settings");
});

//get request for the create-new-recipe page for an article
router.get("/create-new-recipe", (req, res) => {
  const recipeId = req.query.id; // Extract the recipeId from query parameters (will prob need this later on)
  res.render("create-new-recipe");
});

//get request for the create-new-recipe page for an article
router.get("/profile", (req, res) => {
  const recipeId = req.query.id; // Extract the recipeId from query parameters (will prob need this later on)
  res.render("profile");
});

module.exports = router;
