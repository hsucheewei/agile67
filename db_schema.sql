
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY,
  Title TEXT,
  Ingredients TEXT,
  Instructions TEXT,
  Image_Name TEXT,
  Cleaned_Ingredients TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_likes (
    number_likes INTEGER,
    user_id INTEGER,
    recipe_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

CREATE TABLE IF NOT EXISTS user_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_content TEXT NOT NULL,
    posted_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    username TEXT,
    recipe_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);