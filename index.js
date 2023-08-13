const express = require('express');
const app = express();
const session = require('express-session'); 
const port = 3000;
const path = require('path');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// Generate a secret key for session
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');

//items in the global namespace are accessible throught out the node application
global.db = new sqlite3.Database('./database.db',function(err){
  if(err){
    console.error(err);
    process.exit(1); //Bail out we can't connect to the DB
  }else{
    console.log("Database connected");
    global.db.run("PRAGMA foreign_keys=ON"); //This tells SQLite to pay attention to foreign key constraints
  }
});

//express-parser middleware command to parse incoming form data
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use(express.static(path.join(__dirname, 'assets')));

//static command to allow the linking of CSS
app.use(express.static(path.join(__dirname,'public')));

//static command to allow other seperate scripts
app.use(express.static('public'));

// Set up session middleware
app.use(
  session({
    store: new SQLiteStore(),
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport.js authentication strategy
passport.use(
  new LocalStrategy(function (username, password, done) {
    db.get('SELECT * FROM users WHERE username = ?', [username], function (err, user) {
      if (err) {
        return done(err);
      }
      // If no user is found with the provided 'username', return false and a message 
      if (!user) {
        return done(null, false, { message: 'Invalid username or password.' });
      }
      // Use bcrypt to compare the provided 'password' with the hashed password stored in the 'user' from the database.
      bcrypt.compare(password, user.password, function (err, result) {
        //if err return message
        if (err || !result) {
          return done(null, false, { message: 'Invalid username or password.' });
        }
        //if authenticated return null value
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
  db.get('SELECT * FROM users WHERE id = ?', [id], function (err, user) {
    done(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());

//separate routes for the website based on user
const readerRoutes = require('./routes/reader');
const landingRoutes = require('./routes/landing');
const registerRoute = require('./routes/register');
const loginRoute = require('./routes/login');
const leaderBoardRoute = require('./routes/leaderboard');

// Authentication middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

//set the app to use ejs for rendering
app.set('view engine', 'ejs');

//root of the website
app.get('/', (req, res) => {
  res.redirect('reader/home');
});

//this adds routes for readers
app.use('/reader', readerRoutes);
// Only authenticated users can access reader routes
// app.use('/reader', isAuthenticated, readerRoutes);

// unauthenticated users access landing routes
app.use('/landing', landingRoutes);

// this adds routes for user registration
app.use('/register', registerRoute);

// Add the login route to the app
app.use('/login', loginRoute);

app.use('/leaderboard', leaderBoardRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
