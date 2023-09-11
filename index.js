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
const ejs = require('ejs');



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
  res.redirect('login');
}

// Only example of how to lock the pages if you are not logged in
//app.use('/author', isAuthenticated, authorRoutes);
//this will lock all the get and post request within author routes

//function to prevent logged in users to go back to the login page through url
function notAuthenticated(req, res, next) {// this should go on things like the login,register and landing routes
  if (req.isAuthenticated()) {
    return res.redirect('/home');//logged in homepage redirect
  }
  next()
}

//use flash for error messages
app.use(flash());

// Set up session middleware
app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.db', dir: __dirname }), //store session in sqlitedb using connect-sqlite3
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true,
  })
);

//use functions to set up basics and sessions
app.use(passport.initialize());
app.use(passport.session());


//separate routes for the website based on user
const userRoutes = require('./routes/user');
const landingRoutes = require('./routes/landing');
const registerRoute = require('./routes/register');
const loginRoute = require('./routes/login');
const settingsRoute = require('./routes/settings');

//set the app to use ejs for rendering
app.set('view engine', 'ejs');

//this adds routes for readers
app.use('/user', isAuthenticated, userRoutes);
// Only authenticated users can access reader routes
// app.use('/reader', isAuthenticated, readerRoutes);

// unauthenticated users access landing routes
app.use('/landing',notAuthenticated, landingRoutes);

// this adds routes for user registration
app.use('/register',notAuthenticated, registerRoute);

// Add the login route to the app
app.use('/login',notAuthenticated, loginRoute);

app.use('/settings', isAuthenticated, settingsRoute);

// Generating a password for epicurious (default user for CSV injections into the table)
// Password for the default user stored into a variable for db insertion
const epiPassword = 'epipassword';

function insertDefaultUser(callback) {
  // Check if the user "Epicurious" already exists
  db.get('SELECT id FROM users WHERE username = ?', ['epicurious'], (err, user) => {
    if (err) {
      console.error('Error checking for existing user:', err);
    } else if (user) {
      console.log('Default user "Epicurious" already exists. Checking for recipes table...');
      callback(); // Call the callback function to proceed with the next step
    } else {
      // User doesn't exist, proceed to generate and insert the hashed password for the default user
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          console.error('Error generating salt:', err);
        } else {
          bcrypt.hash(epiPassword, salt, (err, hash) => {
            if (err) {
              console.error('Error hashing password:', err);
            } else {
              // 'Hash' variable to insert password into the database
              const hashedPassword = hash;

              // insertion query for the default user
              const insertUserQuery = `
                INSERT INTO users (firstName, lastName, username, password)
                VALUES (?, ?, ?, ?);
              `;

              //insertion values for the default user
              const values = ['Epicurious', 'Website', 'epicurious', hashedPassword];

              db.run(insertUserQuery, values, (err) => {
                if (err) {
                  console.error('Error inserting user:', err);
                } else {
                  console.log('Default user "Epicurious" added successfully.');
                }
                callback(); // Call the callback function to proceed with the next step

                
              });
            }
          });
        }
      });
    }
  });
}

function insertCSVData() {
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
          console.log("Please wait as we are downloading the data into the database...");
          // Read data from the CSV file and insert into the database
          fs.createReadStream('datasets/recipes.csv')
            .pipe(csv())
            .on('data', (row) => {
              const insertQuery = `
                INSERT INTO recipes (Title, Ingredients, Instructions, Image_Name, Cleaned_Ingredients, user_id)
                VALUES (?, ?, ?, ?, ?, ?);
              `;
              db.run(insertQuery, [row.Title, row.Ingredients, row.Instructions, row.Image_Name, row.Cleaned_Ingredients, 1], (err) => {
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
}

// Call the functions sequentially(this must be done or it will load at the functions 
//at the same time which will cause some recipes to fail when connecting to default user)
insertDefaultUser(insertCSVData);

//to route recipe images to the ejs
app.get('/images/:imageName', isAuthenticated, (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, 'datasets', 'recipeImages', imageName);
  res.sendFile(imagePath);
});

//to route profile images to the ejs
app.get('/profileImages/:profileImageName', isAuthenticated, (req, res) => {
  const profileImageName = req.params.profileImageName;
  const profileImagePath = path.join(__dirname, 'datasets', 'profileImages', profileImageName);
  res.sendFile(profileImagePath);
});

//if you run into an error where the local host does not connect PLEASE clean and build the db
app.get('/recipe/:id', isAuthenticated, (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id; // Assuming you have user data available through req.user

  db.get(`
    SELECT recipe.*, user.firstName, user.lastName
    FROM recipes AS recipe
    JOIN users AS user ON recipe.user_id = user.id
    WHERE recipe.id = ?;
  `, [recipeId], (err, recipe) => {
    if (err || !recipe) {
      console.error('Error fetching recipe:', err);
      res.render('error');
    } else {
      const cleanedIngredientsArray = recipe.Cleaned_Ingredients
        .slice(2, -2)
        .split("', '")
        .map((ingredient) => ingredient.trim());

      recipe.Cleaned_Ingredients = cleanedIngredientsArray;

      const instructionsArray = recipe.Instructions.split('\n');
      recipe.Instructions = instructionsArray;

      // Get existing comments and associated user names
      db.all(`
        SELECT user_comments.*, users.firstName, users.lastName
        FROM user_comments
        JOIN users ON user_comments.user_id = users.id
        WHERE user_comments.recipe_id = ?
        ORDER BY user_comments.posted_timestamp DESC;
      `, [recipeId], (err, comments) => {
        if (err) {
          next(err);
        } else {
          // Get the count of likes for the recipe
          db.get('SELECT COUNT(*) AS likes FROM user_likes WHERE recipe_id = ?', [recipeId], (err, likesResult) => {
            if (err) {
              console.error('Error fetching likes count:', err);
              res.render('error');
            } else {
              // Check if the user has already liked the recipe
              db.get('SELECT * FROM user_likes WHERE user_id = ? AND recipe_id = ?', [userId, recipeId], (err, existingLike) => {
                if (err) {
                  console.error('Error checking for existing like:', err);
                  res.render('error');
                } else {
                  const hasLiked = existingLike ? 1 : 0;
                  res.render('recipe', { recipe, comments, likes: likesResult.likes, hasLiked: hasLiked });
                }
              });
            }
          });
        }
      });
    }
  });
});

//recipe page like button
app.post('/recipe/:id/like', isAuthenticated, (req, res) => {
  const userId = req.user.id;
  const recipeId = req.params.id;

  // Check if the user has already liked the article
  db.get('SELECT * FROM user_likes WHERE user_id = ? AND recipe_id = ?', [userId, recipeId], (err, existingLike) => {
    if (err) {
      console.error('Error checking for existing like:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (existingLike) {
        // User has already liked, remove the like
        db.run('DELETE FROM user_likes WHERE user_id = ? AND recipe_id = ?', [userId, recipeId], (err) => {
          if (err) {
            console.error('Error removing like:', err);
            res.status(500).json({ error: 'Internal server error' });
          } else {
            //liked status
            const hasLiked = existingLike !== null;
            // Get the updated number of likes
            db.get('SELECT COUNT(*) AS likes FROM user_likes WHERE recipe_id = ?', [recipeId], (err, result) => {
              if (err) {
                console.error('Error getting updated likes count:', err);
                res.status(500).json({ error: 'Internal server error' });
              } else {
                res.json({ likes: result.likes, hasLiked: hasLiked });
              }
            });
          }
        });
      } else {
        // User hasn't liked yet, add the like
        db.run('INSERT INTO user_likes (user_id, recipe_id) VALUES (?, ?)', [userId, recipeId], (err) => {
          if (err) {
            console.error('Error adding like:', err);
            res.status(500).json({ error: 'Internal server error' });
          } else {
            // Get the updated number of likes
            db.get('SELECT COUNT(*) AS likes FROM user_likes WHERE recipe_id = ?', [recipeId], (err, result) => {
              if (err) {
                console.error('Error getting updated likes count:', err);
                res.status(500).json({ error: 'Internal server error' });
              } else {
                res.json({ likes: result.likes });
              }
            });
          }
        });
      }
    }
  });
});

// insert new comment into db and refresh recipe page
app.post('/recipe/:id/commenting', isAuthenticated, (req, res) => {
  // get user ID from the session or authentication process
  const recipeId = req.params.id;//receipe id
  const userId = req.user.id; // user ID
  const newComment = req.body.new_comment;//new comment
  db.run('INSERT INTO user_comments (comment_content,user_id,recipe_id) VALUES (?,?,?)', [newComment, userId, recipeId], (err) => {
      if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
      }
      else {
        res.redirect('/recipe/'+ recipeId);
      };
  });
});

//default page when opening the application
app.get('/', notAuthenticated, (req, res) => {
  res.render("landing");
});

//Variable to Track Loaded Recipes
let recipesLoadedOnHome = 0;

// Render home page
app.get('/home', isAuthenticated, (req, res) => {
  db.all('SELECT id, Title, Instructions, Image_Name FROM recipes LIMIT 5;', (err, recipes) => {
    if (err || !recipes) {
      console.error('Error fetching recipes:', err);
      res.render('error');
    } else {
      recipesLoadedOnHome += recipes.length; // Increment the count
      res.render("reader-home", { recipes });
    }
  });
});


// Render profile page
app.get('/profile', isAuthenticated, (req, res) => {
  const userId = req.user.id;

  // Fetch user profile data from the database based on the user ID
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, userProfile) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      res.render('error');
    } else {
      // Fetch user's posts from the database based on the user ID
      db.all('SELECT * FROM recipes WHERE user_id = ? ORDER BY id DESC', [userId], (err, userPosts) => {
        if (err) {
          console.error('Error fetching user posts:', err);
          res.render('error');
        } else {
          // Fetch user's liked recipes from the database based on the user ID
          db.all('SELECT recipes.* FROM recipes INNER JOIN user_likes ON recipes.id = user_likes.recipe_id WHERE user_likes.user_id = ?', [userId], (err, likedRecipes) => {
            if (err) {
              console.error('Error fetching liked recipes:', err);
              res.status(500).json({ error: 'Error fetching liked recipes' });
            } else {
              // Debugging: Log the fetched data
              // console.log('User Profile:', userProfile);
              // console.log('User Posts:', userPosts);
              // console.log('Liked Recipes:', likedRecipes);

              // Render the profile template with fetched data
              res.render('profile', { userProfile, userPosts, likedRecipes }); // Pass likedRecipes to the template
            }
          });
        }
      });
    }
  });
});


app.get('/render-profile-card', isAuthenticated, (req, res) => {
  const recipe = req.query.recipe;
  res.render('profile-card', { recipe }); // Use the appropriate view name
});


//render create new recipe page
app.get('/create-new-recipe', isAuthenticated, (req, res) => {
  res.render("create-new-recipe")
});

//leaderboard 
app.get('/leaderboard',isAuthenticated, (req, res) => {
  db.all('SELECT id,Title,Image_Name FROM recipes LIMIT 10 OFFSET 20;', (err, recipes) => {
    if (err || !recipes) {
      console.error('Error fetching recipes:', err);
      res.render('error');
    } else {
      res.render("leaderboard", { recipes });
    }
  });
});



// Route to load more recipes into the reader home
app.get('/load-more', isAuthenticated, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 5; // Number of recipes to load per request
  const offset = (page - 1) * pageSize + recipesLoadedOnHome;

  db.all(`SELECT id, Title, Instructions, Image_Name FROM recipes LIMIT ${pageSize} OFFSET ${offset};`, (err, recipes) => {
    if (err || !recipes) {
      console.error('Error fetching more recipes:', err);
      console.log("error fetching recipes")
      res.status(500).json({ error: 'Error fetching more recipes' });
    } else {
      res.json({ recipes });
    }
  });
});

app.get('/render-home-card', isAuthenticated, (req, res) => {
  const recipe = req.query.recipe;
  res.render('home-card', { recipe }); // Use the appropriate view name
});

//likes db
app.get('/leaderboard', isAuthenticated, (req, res) => {
  db.all('SELECT recipes.*, COUNT(user_likes.id) AS likes_count FROM recipes LEFT JOIN user_likes ON recipes.id = user_likes.recipe_id GROUP BY recipes.id', (err, recipes) => {
      if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
      }
      res.render('leaderboard', { recipes });
  });s
});

app.post('/likes-content/:id', isAuthenticated, (req, res) => {
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


app.get('/search', isAuthenticated, (req, res) => {
  const searchQuery = req.query.query;
  
  // Store the search query in a session or as a cookie
  req.session.searchQuery = searchQuery;

  // Sample SQL query (you should adapt this to your database structure):
  db.all('SELECT * FROM recipes WHERE Title LIKE ? LIMIT 5', [`%${searchQuery}%`], (err, searchResults) => {
    if (err) {
      console.error('Error searching for recipes:', err);
      res.render('error');
    } else {
      // Render a search results page with the matching recipes
      res.render('search-results', { searchResults });
    }
  });
});

queriesLoadedOnHome = 0;

// Route to load more queries
app.get('/load-more-queries', isAuthenticated, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 5; // Number of queries to load per request
  const offset = (page - 1) * pageSize + queriesLoadedOnHome;

  // Retrieve the search query from the session or cookie
  const searchQuery = req.session.searchQuery || '';

  db.all('SELECT id, Title, Instructions, Image_Name FROM recipes WHERE Title LIKE ? LIMIT ? OFFSET ?;', [`%${searchQuery}%`, pageSize, offset], (err, recipes) => {
    if (err || !recipes) {
      console.error('Error fetching more recipes queries:', err);
      res.status(500).json({ error: 'Error fetching more recipes queries' });
    } else {
      res.json({ recipes });
    }
  });
});



// Start the server
app.listen(port, () => {
  console.log('App listening on port 3000');
});