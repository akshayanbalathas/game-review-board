# Game Review Board

Game Review Board is a single page web application where users can browse games, view game details, write reviews, save favourite games, and explore community statistics.

## How to Run

1. Open a terminal and navigate to the `server` folder.
2. Run `npm install`.
3. Run `npm start`.
4. Open your browser and go to `http://localhost:3000`.

## Features

- Browse and search for games with genre filtering and sorting
- View detailed information for individual games
- Add and delete reviews
- Real-time live updates for community reviews using Socket.IO
- Add and remove favourite games
- View all community reviews
- Explore statistics through D3.js visualizations (release year, monthly trends, rating distribution, top genres)
- User authentication (login and sign up)
- Navigate the application through Vue Router in a single page interface

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js, Socket.IO, SQLite3 |
| Frontend | HTML, CSS, JavaScript, Vue.js, Vue Router, jQuery, Bootstrap, D3.js |
| Graphics | SVG (D3-generated charts) |
| Game Data | [RAWG API](https://rawg.io/apidocs) |
| Extra Technology | Socket.IO (real-time updates) |

## Routes

- `/#/` — Home page (browse games)
- `/#/game/:id` — Game detail page
- `/#/reviews` — All community reviews
- `/#/stats` — Statistics dashboard
- `/#/favourites` — Favourite games
- `/#/login` — Login page
- `/#/signup` — Sign up page

## Project Structure

```
game-review-board/
├── data/
│   └── games.db                    SQLite database
├── public/
│   ├── index.html                  Main SPA entry point
│   ├── css/style.css               Global styles
│   └── js/
│       ├── main.js                 Vue app setup
│       ├── router.js               Vue Router config
│       └── components/
│           ├── NavBar.js           Shared navigation bar
│           ├── HomePage.js         Game browsing and search
│           ├── GamePage.js         Game detail and reviews
│           ├── AllReviewsPage.js   Community reviews
│           ├── StatsPage.js        D3.js statistics dashboard
│           ├── FavouritesPage.js   Favourite games management
│           ├── LoginPage.js        User login
│           └── SignUpPage.js       User registration
├── scripts/
│   └── rawg.py                     RAWG API data import script
├── server/
│   └── server.js                   Express server with API routes
├── group_members.html
├── README.md
└── package.json
```

## Project Notes

- The frontend is a single page application built with Vue 3 and Vue Router
- SQLite3 stores game data, reviews, and favourites
- D3.js generates SVG charts on the statistics page
- Socket.IO provides real-time updates for reviews
- The RAWG API data import script fetches game metadata including images and ratings
- Adult content was manually reviewed and removed from the dataset
