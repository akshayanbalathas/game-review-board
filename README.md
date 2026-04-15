```markdown
# Game Review Board

Game Review Board is a single page web application where users can browse games, view game details, write reviews, and explore community statistics.

## Overview

This project was developed as a group web application using a Node.js and Express.js backend with a Vue-based frontend. The application was refactored into a single page app using Vue Router, so navigation is handled dynamically through a shared `index.html` file and routed views.

## Features

- Browse and search for games
- View detailed information for individual games
- Add and delete reviews
- View all community reviews
- Explore statistics through D3.js visualizations
- Navigate the application through Vue Router in a single page interface

## Routes

The application uses hash-based Vue Router paths such as:

- `/#/`
- `/#/reviews`
- `/#/stats`
- `/#/game/123`

## Frontend Structure

```text
public/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── main.js
    ├── router.js
    └── components/
        ├── NavBar.js
        ├── HomePage.js
        ├── GamePage.js
        ├── AllReviewsPage.js
        └── StatsPage.js
````

## Tech Stack

- Backend: Node.js, Express.js, SQLite3
- Frontend: HTML, CSS, JavaScript, Vue Router, Bootstrap, D3.js
- Game Data Source: RAWG API
- Local Database: SQLite3

## How to Run

1. Open a terminal.
2. Navigate to the `server` folder.
3. Run `npm install`.
4. Run `npm start`.
5. Open your browser and go to `http://localhost:3000`.

## Project Notes

- The frontend was refactored into a single page application using Vue Router.
- Navigation is handled through routed Vue components.
- A shared NavBar component is used across the whole application.
- SQLite3 is used as the local database for storing game and review data.
- D3.js is used for charts and data visualization on the stats page.
- The `rawg.py` script was updated to include more game information, such as images and other metadata.
- Adult games were manually reviewed and removed from the dataset when identified.

## Pages

* **Home Page**: browse and search for games
* **Game Detail Page**: view game information and reviews
* **All Reviews Page**: see reviews from all users
* **Statistics Dashboard**: view charts for release years, monthly trends, and rating distribution