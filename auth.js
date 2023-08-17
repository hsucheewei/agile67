const express = require("express");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');


// Passport.js authentication strategy
passport.use(
  new LocalStrategy(function (username, password, done) {
    global.db.get('SELECT * FROM users WHERE username = ?', [username], function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Invalid username' });
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (err || !result) {
          return done(null, false, { message: 'Invalid password.' });
        }
        return done(null, user);
      });
    });
  })
);

// Passport serialize and deserialize user functions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
    global.db.get('SELECT * FROM users WHERE id = ?', [id], function (err, user) {
    done(err, user);
  });
});

// Export any necessary middleware or functions
module.exports = passport;
