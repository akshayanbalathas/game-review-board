import requests
import sqlite3
import time
import os

# -----------------------
# Config
# -----------------------
API_KEY = "cb8e1e94869749b68581b56771c93ebb"
RAWG_URL = "https://api.rawg.io/api/games"
PAGE_SIZE = 40  # max per RAWG API is 40
MAX_PAGES = 13  # fetch 13 pages (~520 games)
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "games.db")

# -----------------------
# Setup SQLite
# -----------------------
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

# Create table
cursor.execute("""
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    released TEXT
)
""")
conn.commit()

# -----------------------
# Function to fetch games
# -----------------------
def fetch_games(page):
    params = {
        "key": API_KEY,
        "page_size": PAGE_SIZE,
        "page": page
    }
    response = requests.get(RAWG_URL, params=params)
    if response.status_code != 200:
        print(f"Error fetching page {page}: {response.status_code}")
        return []
    data = response.json()
    return data.get("results", [])

# -----------------------
# Insert games into DB
# -----------------------
def insert_games(games):
    for game in games:
        game_id = game.get("id")
        name = game.get("name")
        released = game.get("released")
        cursor.execute(
            "INSERT OR IGNORE INTO games (id, name, released) VALUES (?, ?, ?)",
            (game_id, name, released)
        )
    conn.commit()

# -----------------------
# Main loop
# -----------------------
for page in range(1, MAX_PAGES + 1):
    print(f"Fetching page {page}...")
    games_list = fetch_games(page)
    if not games_list:
        break
    insert_games(games_list)
    time.sleep(1)  # be polite to the API

print("Done fetching and storing games!")
conn.close()