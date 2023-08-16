const fs = require('fs');
const csvParser = require('csv-parser');
const sqlite3 = require('sqlite3').verbose();

// Initialize database connection
const db = new sqlite3.Database('recipes.db');

// Path to your CSV file
const csvFilePath = 'datasets/recipes.csv';

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS recipes (
    title TEXT,
    ingredients TEXT,
    instructions TEXT,
    image_name TEXT,
    cleaned_ingredients TEXT
  )
`);

// Read and insert data from CSV
fs.createReadStream(csvFilePath)
  .pipe(csvParser())
  .on('data', (row) => {
    db.run(
      'INSERT INTO recipes (title, ingredients, instructions, image_name, cleaned_ingredients) VALUES (?, ?, ?, ?, ?)',
      [row.Title, row.Ingredients, row.Instructions, row.Image_Name, row.Cleaned_Ingredients],
      (err) => {
        if (err) {
          console.error('Error inserting row:', err);
        }
      }
    );
  })
  .on('end', () => {
    console.log('CSV data successfully processed');
    db.close();
  });
