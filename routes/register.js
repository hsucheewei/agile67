const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

// Register route
router.get("/", function (req, res) {
  res.render("register"); // Assuming you have a register.ejs file in the views folder
});

router.post("/", function (req, res) {
  const { username, password } = req.body;

  // Check if the username is taken
  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    function (err, user) {
      if (err) {
        console.error(err);
      }

      if (user) {
        res
          .status(409)
          .send("Username already exists. Please choose a different username.");
      } else {
        // If not taken, hash the password before storing in the database
        bcrypt.hash(password, 10, function (err, hashedPassword) {
          if (err) {
            console.error(err);
          }

          // Insert the new username and password into the database
          db.run(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, hashedPassword],
            function (err) {
              if (err) {
                console.error(err);
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
