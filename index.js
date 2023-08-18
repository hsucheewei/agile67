const express = require('express');
const app = express();
const session = require('express-session');
const port = 3000;
const path = require('path');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const flash = require('express-flash')
const methodOverride = require('method-override')
const ejs = require('ejs');

//calling of override method for logout
app.use(methodOverride('_method'))

// Create a SQLite database connection
global.db = new sqlite3.Database('./database.db', function (err) {
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

// Import the authentication module
const auth = require('./auth');

// Authentication middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Only example of how to lock the pages if you are not logged in
//app.use('/author', isAuthenticated, authorRoutes);
//this will lock all the get and post request within author routes

//function to prevent logged in users to go back to the login page through url
function notAuthenticated(req, res, next) {// this should go on things like the login,register and landing routes
  if (req.notAuthenticated()) {
    return res.redirect('/');//logged in homepage redirect
  }
  next()
}

//use flash for error messages
app.use(flash());

// Set up session middleware
app.use(
  session({
    store: new SQLiteStore(),
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
  })
);

//use functions to set up basics and sessions
app.use(passport.initialize());
app.use(passport.session());

app.delete('logout', (res, req) => {
  req.logOut()
  req.redirect('/login')
})


//separate routes for the website based on user
const readerRoutes = require('./routes/reader');
const landingRoutes = require('./routes/landing');
const registerRoute = require('./routes/register');
const loginRoute = require('./routes/login');

const settingsRoute = require('./routes/settings');



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



app.use('/settings', settingsRoute);

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
        console.log('The application is ready for launch.');
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
            console.log('The application is ready for launch.');
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

      // Manually split the Cleaned_Ingredients string and trim each ingredient
      // Remove square brackets and split using single quotes as delimiters
      const cleanedIngredientsArray = recipe.Cleaned_Ingredients
        .slice(2, -2) // Remove square brackets and ' at start and end of array
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

//render home page
app.get('/', (req, res) => {
  db.all('SELECT id,Title,Instructions,Image_Name FROM recipes LIMIT 5;', (err, recipes) => {
    if (err || !recipes) {
      console.error('Error fetching recipes:', err);
      res.render('error');
    } else {
      res.render("reader-home", { recipes });
    }
  });
});

//leaderboard 
app.get('/leaderboard', (req, res) => {
  db.all('SELECT id,Title,Image_Name FROM recipes LIMIT 10 OFFSET 20;', (err, recipes) => {
    if (err || !recipes) {
      console.error('Error fetching recipes:', err);
      res.render('error');
    } else {
      res.render("leaderboard", { recipes });
    }
  });
});

// Add this route to handle infinite scrolling
app.get('/load-more', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 5; // Number of recipes to load per request
  const offset = (page - 1) * pageSize;

  db.all(`SELECT id, Title, Instructions, Image_Name FROM recipes LIMIT ${pageSize} OFFSET ${offset};`, (err, recipes) => {
    if (err || !recipes) {
      console.error('Error fetching more recipes:', err);
      res.status(500).json({ error: 'Error fetching more recipes' });
    } else {
      res.json({ recipes });
    }
  });
});


app.get('/render-home-card', (req, res) => {
  const recipe = req.query.recipe;
  res.render('home-card', { recipe }); // Use the appropriate view name
});

//likes db
app.get('/leaderboard', (req, res) => {
  db.all('SELECT recipes.*, COUNT(user_likes.id) AS likes_count FROM recipes LEFT JOIN user_likes ON recipes.id = user_likes.recipe_id GROUP BY recipes.id', (err, recipes) => {
      if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
      }
      res.render('leaderboard', { recipes });
  });s
});

app.post('/likes-content/:id', (req, res) => {
  const recipeId = req.params.id;
  // get user ID from the session or authentication process
  const userId = 1; // replace with the actual user ID

  db.run('INSERT INTO user_likes (user_id, recipe_id) VALUES (?, ?)', [userId, recipeId], (err) => {
      if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
      }
      res.redirect('/leaderboard');
  });
});



// Start the server
app.listen(port, () => {
  console.log('App listening on port 3000');
});

