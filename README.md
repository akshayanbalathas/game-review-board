# Game Review Board

A web app where users can browse games, write reviews, and explore community stats.

## How to Run

```bash
cd server
npm install
npm start
```

Open **http://localhost:3000**

## Tech Stack

- **Backend**: Node.js, Express.js, SQLite3
- **Frontend**: HTML, CSS, JavaScript, Bulma, jQuery, D3.js
- **Game Data**: [RAWG API](https://rawg.io/apidocs)

## Pages

- **Home** — Browse and search games
- **Game Detail** — View game info and write reviews
- **All Reviews** — See all community reviews
- **Stats Dashboard** — D3.js charts (release year, monthly trend, rating distribution)

## In Progress

- Vue.js frontend migration
- User authentication (JWT)
- Favorites system
- Responsive design