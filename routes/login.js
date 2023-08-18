const express = require('express');
const router = express.Router();
const passport = require('passport');
const flash = require('express-flash');

// Login route
router.get('/', (req, res) => {
  // Render the login page with the flash message
  res.render('login');
});

// redirect based on results of authentication
router.post('/', passport.authenticate('local', {
  successRedirect: '/home', // Replace with the path to the dashboard page after successful login
  failureRedirect: '/login',
  failureFlash:true
}));

module.exports = router;