import requests
import sqlite3
import time
import os

# -----------------------
# Config
# -----------------------
API_KEY = "cb8e1e94869749b68581b56771c93ebb"
RAWG_URL = "https://api.rawg.io/api/games"
PAGE_SIZE = 40
MAX_PAGES = 13

# IMPORTANT: matches your project-root/data structure
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "games.db")

# -----------------------
# Setup DB
# -----------------------
os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

cursor.execute("""
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
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER,
    username TEXT,
    rating INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()

# -----------------------
# Fetch games
# -----------------------
def fetch_games(page):
    params = {
        "key": API_KEY,
        "page_size": PAGE_SIZE,
        "page": page,
        "ordering": "-rating"
    }

    try:
        r = requests.get(RAWG_URL, params=params, timeout=10)
        if r.status_code != 200:
            print(f"Error page {page}: {r.status_code}")
            return []

        return r.json().get("results", [])

    except Exception as e:
        print(f"Exception page {page}: {e}")
        return []

# -----------------------
# Insert games (FULL VERSION)
# -----------------------
def insert_games(games):
    for game in games:
        game_id = game.get("id")
        name = game.get("name", "")
        released = game.get("released")
        background_image = game.get("background_image")
        rating = game.get("rating")
        ratings_count = game.get("ratings_count")
        metacritic = game.get("metacritic")

        # genres → CSV string
        genres = ", ".join([g["name"] for g in game.get("genres", [])]) or None

        # platforms → CSV string
        platforms = ", ".join(
            [p["platform"]["name"] for p in game.get("platforms", [])]
        ) or None

        # OPTIONAL: RAWG does NOT reliably include full description in list endpoint
        description = game.get("description_raw") or game.get("description") or None

        cursor.execute("""
            INSERT OR REPLACE INTO games
            (id, name, released, background_image, rating,
             ratings_count, metacritic, genres, platforms, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            game_id, name, released, background_image,
            rating, ratings_count, metacritic,
            genres, platforms, description
        ))

    conn.commit()

# -----------------------
# Main loop
# -----------------------
total = 0

for page in range(1, MAX_PAGES + 1):
    print(f"Fetching page {page}/{MAX_PAGES}...")
    games = fetch_games(page)

    if not games:
        print("No more results.")
        break

    insert_games(games)
    total += len(games)

    print(f"Inserted {len(games)} games (total {total})")
    time.sleep(0.5)

print(f"\nDone. Stored {total} games in database.")
conn.close()