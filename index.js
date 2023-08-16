const express = require('express');
const app = express();
const session = require('express-session');
const port = 3000;
const path = require('path');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');

// Create a SQLite database connection
const db = new sqlite3.Database('./database.db', function (err) {
  if (err) {
    console.error(err);
    process.exit(1); // Bail out if unable to connect to the DB
  } else {
    console.log("Database connected");
    db.run("PRAGMA foreign_keys=ON"); // Enable foreign key constraints
  }
});

// Express middleware for parsing incoming form data
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

// Set up session middleware
app.use(
  session({
    store: new SQLiteStore(),
    secret: 'your_secret_key', // Replace with a secret key
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
      if (!user) {
        return done(null, false, { message: 'Invalid username or password.' });
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (err || !result) {
          return done(null, false, { message: 'Invalid username or password.' });
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
const settingsRoute = require('./routes/settings');
const aboutRoute = require('./routes/about')

// Authentication middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

//set the app to use ejs for rendering
app.set('view engine', 'ejs');


//this adds routes for readers
app.use('/', readerRoutes);
// Only authenticated users can access reader routes
// app.use('/reader', isAuthenticated, readerRoutes);

// unauthenticated users access landing routes
app.use('/landing', landingRoutes);

// this adds routes for user registration
app.use('/register', registerRoute);

// Add the login route to the app
app.use('/login', loginRoute);

app.use('/leaderboard', leaderBoardRoute);

app.use('/settings', settingsRoute);

app.use('/about', aboutRoute)

// Check if the "recipes" table exists in the database
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='recipes';", (err, result) => {
  if (err) {
    console.error('Error checking for existing table:', err);
    return;
  }

  if (result) {
    // Check if the "recipes" table has any rows
    db.get("SELECT COUNT(*) AS count FROM recipes;", (rowCountErr, rowCountResult) => {
      if (rowCountErr) {
        console.error('Error checking row count:', rowCountErr);
        return;
      }

      if (rowCountResult.count > 0) {
        console.log('The "recipes" table already exists and has rows. Skipping data insertion.');
      } else {
        console.log("please wait as we are downloading the data into the database...")
        // Read data from the CSV file and insert into the database
        fs.createReadStream('datasets/recipes.csv')
          .pipe(csv())
          .on('data', (row) => {
            const insertQuery = `
              INSERT INTO recipes (Title, Ingredients, Instructions, Image_Name, Cleaned_Ingredients)
              VALUES (?, ?, ?, ?, ?);
            `;
            db.run(insertQuery, [row.Title, row.Ingredients, row.Instructions, row.Image_Name, row.Cleaned_Ingredients], (err) => {
              if (err) {
                console.error('Error inserting data:', err);
              }
            });
          })
          .on('end', () => {
            console.log('Data inserted from CSV into the database');
          });
      }
    });
  }
});


app.get('/images/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, 'datasets', 'recipeImages', imageName);
  res.sendFile(imagePath);
});

app.get('/recipe/:id', (req, res) => {
  const recipeId = req.params.id;
  db.get('SELECT * FROM recipes WHERE id = ?', [recipeId], (err, recipe) => {
    if (err || !recipe) {
      console.error('Error fetching recipe:', err);
      res.render('error');
    } else {
      console.log('Fetched recipe:', recipe);

      // Manually split the Cleaned_Ingredients string and trim each ingredient
      // Remove square brackets and split using single quotes as delimiters
      const cleanedIngredientsArray = recipe.Cleaned_Ingredients
        .slice(1, -1) // Remove square brackets
        .split("', '")
        .map((ingredient) => ingredient.trim()); // Trim any extra spaces

      recipe.Cleaned_Ingredients = cleanedIngredientsArray;
      // Split the instructions by newlines into an array
      const instructionsArray = recipe.Instructions.split('\n');
      recipe.Instructions = instructionsArray;
      res.render('recipe', { recipe });
    }
  });
});




// Start the server
app.listen(port, () => {
  console.log('App listening on port 3000');
});