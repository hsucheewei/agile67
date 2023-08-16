
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

-- BEGIN TRANSACTION;

-- -- Settings table
-- CREATE TABLE bannerSettings (
--   id INTEGER PRIMARY KEY,
--   banner_header TEXT,
--   banner_subheader TEXT,
--   author_name TEXT
-- );

-- INSERT INTO bannerSettings (banner_header, banner_subheader, author_name)
-- VALUES ('Microblog Blog Title', 'A microblog Subtitle', 'Administrator');

-- -- End of settings table

-- -- Draft and published articles table
-- CREATE TABLE draftArticles (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   title TEXT,
--   subtitle TEXT,
--   body TEXT,
--   created DATETIME DEFAULT (datetime('now','localtime')), -- Auto create based on local time
--   lastModified DATETIME DEFAULT (datetime('now','localtime'))
-- );

-- CREATE TABLE publishedArticles (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   title TEXT,
--   subtitle TEXT,
--   body TEXT,
--   created DATETIME DEFAULT (datetime('now','localtime')),
--   published DATETIME DEFAULT (datetime('now','localtime')),
--   likes INTEGER DEFAULT 0
-- );

-- CREATE TABLE comments (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   commentBody TEXT,
--   commentDate DATETIME DEFAULT (datetime('now','localtime')),
--   articleId INTEGER, -- Foreign key column to link comments to publishedArticles
--   FOREIGN KEY (articleId) REFERENCES publishedArticles(id)  -- Foreign key defined
-- );

-- CREATE TABLE users (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   username TEXT UNIQUE NOT NULL,
--   password TEXT NOT NULL
-- );


-- -- Dummy data insertion for testing purposes

-- INSERT INTO draftArticles (title, subtitle, body) 
-- VALUES ('Getting Started', 'A Daunting Task', 'It is my first time learning to code a server.');

-- INSERT INTO draftArticles (title, subtitle, body)
-- VALUES ('Next Steps', 'Learning about SQL', 'Im trying to learn sql to write the code for my server.');

-- INSERT INTO publishedArticles (title, subtitle, body)
-- VALUES ('Third step', 'Learning about EJS', 'It is my first time using a templating system like EJS.');

-- INSERT INTO publishedArticles (title, subtitle, body)
-- VALUES ('Fourth step', 'May the fouth be with you', 'Im bored just making star wars quotes at this point.');

-- INSERT INTO comments (commentBody,articleId)
-- VALUES ('Dummy comment sentence that i put in to test','1');

-- -- End of draft and published articles table

-- COMMIT;

CREATE TABLE recipes (
  id INTEGER PRIMARY KEY,
  Title TEXT,
  Ingredients TEXT,
  Instructions TEXT,
  Image_Name TEXT,
  Cleaned_Ingredients TEXT
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL
);