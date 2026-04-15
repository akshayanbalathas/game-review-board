const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;


// -----------------------
// Connect to SQLite DB
// -----------------------
const dbPath = path.resolve(__dirname, "..","data", "games.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error("DB connection error:", err.message);
  console.log("Connected to SQLite DB at", dbPath);
});

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      released TEXT,
      background_image TEXT,
      rating REAL,
      ratings_count INTEGER,
      metacritic INTEGER,
      genres TEXT,
      platforms TEXT,
      description TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER,
      username TEXT,
      rating INTEGER CHECK(rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS favourites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL UNIQUE,
      game_name TEXT NOT NULL,
      game_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("Tables ready");
});

// -----------------------
// Middleware
// -----------------------
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
app.use(express.static(path.join(__dirname, "..", "public")));

// -----------------------
// Game Routes
// -----------------------

// GET /games — list with optional search, genre, sort
app.get("/games", (req, res) => {
  const { search, genre, sort, limit = 60, offset = 0 } = req.query;

  let conditions = [];
  let params = [];

  // Always exclude adult content
  conditions.push("(genres IS NULL OR (genres NOT LIKE '%Adult%' AND genres NOT LIKE '%NSFW%' AND genres NOT LIKE '%Eroge%' AND genres NOT LIKE '%Hentai%'))");

  if (search) {
    conditions.push("name LIKE ?");
    params.push(`%${search}%`);
  }
  if (genre) {
    conditions.push("genres LIKE ?");
    params.push(`%${genre}%`);
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  let orderBy = "released DESC";
  if (sort === "rating") orderBy = "rating DESC";
  else if (sort === "metacritic") orderBy = "metacritic DESC";
  else if (sort === "name") orderBy = "name ASC";

  const sql = `SELECT id, name, released, background_image, rating, ratings_count, metacritic, genres, platforms
               FROM games ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;

  db.all(sql, [...params, parseInt(limit), parseInt(offset)], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /games/genres — distinct genres list
app.get("/genres", (req, res) => {
  db.all("SELECT genres FROM games WHERE genres IS NOT NULL", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const blocked = new Set(['Adult', 'NSFW', 'Eroge']);
    const genreSet = new Set();
    rows.forEach(r => {
      if (r.genres) r.genres.split(",").forEach(g => {
        const genre = g.trim();
        if (!blocked.has(genre)) genreSet.add(genre);
      });
    });
    res.json([...genreSet].sort());
  });
});

// GET /games/:id — single game full detail
app.get("/games/:id", (req, res) => {
  db.get("SELECT * FROM games WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Game not found" });
    res.json(row);
  });
});

// -----------------------
// Review Routes
// -----------------------

// GET /reviews — all reviews with game name
app.get("/reviews", (req, res) => {
  const sql = `
    SELECT r.*, g.name as game_name, g.background_image as game_image
    FROM reviews r
    LEFT JOIN games g ON r.game_id = g.id
    ORDER BY r.created_at DESC
    LIMIT 100
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /games/:id/reviews — reviews for a specific game
app.get("/games/:id/reviews", (req, res) => {
  db.all(
    "SELECT * FROM reviews WHERE game_id = ? ORDER BY created_at DESC",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// POST /reviews — add a review
app.post("/reviews", (req, res) => {
  const { game_id, username, rating, comment } = req.body;
  if (!game_id || !username || !rating || !comment) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  const sql = `INSERT INTO reviews (game_id, username, rating, comment) VALUES (?, ?, ?, ?)`;
  db.run(sql, [game_id, username.trim(), parseInt(rating), comment.trim()], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Review added", id: this.lastID });
  });
});

// DELETE /reviews/:id
app.delete("/reviews/:id", (req, res) => {
  db.run("DELETE FROM reviews WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Review not found" });
    res.json({ message: "Review deleted" });
  });
});

// -----------------------
// Favourites Routes
// -----------------------
// GET /favourites — get all favourite games
app.get("/favourites", (req, res) => {
  db.all(
    "SELECT * FROM favourites ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// GET /favourites/:gameId — check if a game is favourited
app.get("/favourites/:gameId", (req, res) => {
  db.get(
    "SELECT * FROM favourites WHERE game_id = ?",
    [req.params.gameId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ favourited: !!row });
    }
  );
});

// POST /favourites — add a favourite
app.post("/favourites", (req, res) => {
  const { game_id, game_name, game_image } = req.body;

  if (!game_id || !game_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.run(
    "INSERT OR IGNORE INTO favourites (game_id, game_name, game_image) VALUES (?, ?, ?)",
    [game_id, game_name.trim(), game_image || null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      if (this.changes === 0) {
        return res.json({ message: "Already in favourites" });
      }

      res.json({ message: "Favourite added", id: this.lastID });
    }
  );
});

// DELETE /favourites/:gameId — remove a favourite
app.delete("/favourites/:gameId", (req, res) => {
  db.run(
    "DELETE FROM favourites WHERE game_id = ?",
    [req.params.gameId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        return res.status(404).json({ error: "Favourite not found" });
      }
      res.json({ message: "Favourite removed" });
    }
  );
});

// -----------------------
// Stats Route (for D3)
// -----------------------
app.get("/stats", (req, res) => {
  const stats = {};

  db.get("SELECT COUNT(*) as total FROM reviews", [], (err, row) => {
    stats.totalReviews = row ? row.total : 0;

    db.all(
      "SELECT rating, COUNT(*) as count FROM reviews GROUP BY rating ORDER BY rating",
      [],
      (err, rows) => {
        stats.ratingDistribution = rows || [];

        db.all(
          `SELECT g.name, AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
           FROM reviews r JOIN games g ON r.game_id = g.id
           GROUP BY g.id HAVING review_count >= 1
           ORDER BY avg_rating DESC, review_count DESC LIMIT 10`,
          [],
          (err, rows) => {
            stats.topRatedGames = rows || [];

            db.all(
              `SELECT SUBSTR(released, 1, 4) as year, COUNT(*) as count
               FROM games WHERE released IS NOT NULL AND released != ''
               GROUP BY year ORDER BY year DESC LIMIT 15`,
              [],
              (err, rows) => {
                stats.gamesByYear = rows || [];

                db.all(
                  `SELECT genres FROM games WHERE genres IS NOT NULL`,
                  [],
                  (err, rows) => {
                    const genreCount = {};
                    (rows || []).forEach(r => {
                      if (r.genres) r.genres.split(",").forEach(g => {
                        const genre = g.trim();
                        if (genre) genreCount[genre] = (genreCount[genre] || 0) + 1;
                      });
                    });
                    stats.genreDistribution = Object.entries(genreCount)
                      .map(([genre, count]) => ({ genre, count }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 10);

                    res.json(stats);
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

// GET /stats/months — games count by release month
app.get("/stats/months", (req, res) => {
  db.all(
    `SELECT SUBSTR(released, 6, 2) as month, COUNT(*) as count
     FROM games WHERE released IS NOT NULL AND released != ''
     GROUP BY month ORDER BY month`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// GET /stats/years — games count by release year
app.get("/stats/years", (req, res) => {
  db.all(
    `SELECT SUBSTR(released, 1, 4) as year, COUNT(*) as count
     FROM games WHERE released IS NOT NULL AND released != ''
     GROUP BY year ORDER BY year DESC LIMIT 20`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// -----------------------
// Start Server
// -----------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});