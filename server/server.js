const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// -----------------------
// Connect to SQLite DB
// -----------------------
const dbPath = path.resolve(__dirname, "..", "data", "games.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error("DB connection error:", err.message);
  console.log("Connected to SQLite DB");
});

db.run(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER,
    username TEXT,
    rating INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) console.error("Error creating reviews table:", err.message);
  else console.log("Reviews table ready");
});

// -----------------------
// Middleware
// -----------------------
app.use(express.json()); // parse JSON request body
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  next();
});
app.use(express.static(path.join(__dirname, '..', 'public'))); // serve static files from public/

// -----------------------
// Routes
// -----------------------

// Get all games (basic)
app.get("/games", (req, res) => {
  const sql = "SELECT id, name, released FROM games ORDER BY released DESC";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get single game by ID
app.get("/games/:id", (req, res) => {
  const sql = "SELECT id, name, released FROM games WHERE id = ?";
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Game not found" });
    res.json(row);
  });
});

// Optional: search by name
app.get("/games/search/:query", (req, res) => {
  const query = `%${req.params.query}%`;
  const sql = "SELECT id, name, released FROM games WHERE name LIKE ?";
  db.all(sql, [query], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/reviews", (req, res) => {
  const { game_id, username, rating, comment } = req.body;

  const sql = `
    INSERT INTO reviews (game_id, username, rating, comment)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [game_id, username, rating, comment], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Review added", id: this.lastID });
  });
});

app.get("/reviews", (req, res) => {
  const sql = `
    SELECT r.*, g.name as game_name 
    FROM reviews r 
    LEFT JOIN games g ON r.game_id = g.id 
    ORDER BY r.created_at DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/games/:id/reviews", (req, res) => {
  const sql = `
    SELECT * FROM reviews WHERE game_id = ?
    ORDER BY created_at DESC
  `;

  db.all(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.delete("/reviews/:id", (req, res) => {
  const sql = "DELETE FROM reviews WHERE id = ?";
  db.run(sql, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Review not found" });
    res.json({ message: "Review deleted" });
  });
});

// -----------------------
// Start server
// -----------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});