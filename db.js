const sqlite3 = require('sqlite3').verbose();

let db;

function connectToDb(callback) {
  db = new sqlite3.Database('./database.db', function (err) {
    if (err) {
      console.error('Error connecting to database:', err);
      return callback(err);
    }
    console.log("Database connected");
    db.run("PRAGMA foreign_keys=ON"); // Enable foreign key constraints
    return callback(null);
  });
}

function getDb() {
  return db;
}

module.exports = { connectToDb, getDb };
