const express = require('express');
const router = express.Router();
const passport = require('passport');

// Login route
router.get('/', function (req, res) {
  res.render('login');
});

// redirect based on results of authentication
router.post('/', passport.authenticate('local', {
  successRedirect: '/author/home', // Replace with the path to the dashboard page after successful login
  failureRedirect: '/login',
}));

module.exports = router;
