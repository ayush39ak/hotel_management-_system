const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Initialize SQLite database
const db = new sqlite3.Database('hotel.db', (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create users table if it doesn't exist
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);`;
db.run(createUsersTable, (err) => {
  if (err) {
    console.error('Could not create users table', err);
  }
});

// Test route to get all users
app.get('/users', (req, res) => {
  db.all('SELECT id, username FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 