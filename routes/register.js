const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const assert = require("assert");

// Register route
router.get("/", function (req, res) {
  const registrationError = req.session.registrationError;
  req.session.registrationError = null; // Clear the error message after retrieving
  
  res.render("register", { registrationError }); // return register page and message
});

//Register form submission
router.post("/", function (req, res) {
  const { firstname, lastname, username, password } = req.body;

  // Check if the username is taken
  global.db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    function (err, user) {
      if (err) {
        console.error(err);
        req.session.registrationError = "An internal error occurred. Please try again later.";
        return res.redirect("/register");
      }

      if (user) {
        req.session.registrationError = "Username already exists. Please choose a different username.";
        return res.redirect("/register");
      } else {
        // If not taken, hash the password before storing in the database
        bcrypt.hash(password, 10, function (err, hashedPassword) {
          if (err) {
            console.error(err);
            req.session.registrationError = "An internal error occurred. Please try again later.";
            return res.redirect("/register");
          }

          // Insert the new user information into the database
          global.db.run(
            "INSERT INTO users (firstname, lastname, username, password) VALUES (?, ?, ?, ?)",
            [firstname, lastname, username, hashedPassword],
            function (err) {
              if (err) {
                console.error(err);
                req.session.registrationError = "An internal error occurred. Please try again later.";
                return res.redirect("/register");
              }

              // Redirect to the login page after successful registration
              res.redirect("/login");
            }
          );
        });
      }
    }
  );
});

module.exports = router;
