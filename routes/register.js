const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const assert = require("assert");

// Register route
router.get("/", function (req, res) {
  res.render("register"); // Assuming you have a register.ejs file in the views folder
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
        return res.status(500).send("Internal Server Error");
      }

      if (user) {
        return res.status(409).send("Username already exists. Please choose a different username.");
      } else {
        // If not taken, hash the password before storing in the database
        bcrypt.hash(password, 10, function (err, hashedPassword) {
          if (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error");
          }

          // Insert the new user information into the database
          global.db.run(
            "INSERT INTO users (firstname, lastname, username, password) VALUES (?, ?, ?, ?)",
            [firstname, lastname, username, hashedPassword],
            function (err) {
              if (err) {
                console.error(err);
                return res.status(500).send("Internal Server Error");
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
