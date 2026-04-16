# Game Review Board

Game Review Board is a single page web application where users can browse games, view game details, write reviews, save favourite games, and explore community statistics.

## Overview

This project was developed as a group web application using a Node.js and Express.js backend with a Vue-based frontend. The application was refactored into a single page app using Vue Router, so navigation is handled dynamically through a shared `index.html` file and routed views.

## Features

- Browse and search for games
- View detailed information for individual games
- Add and delete reviews
- Real-time live updates for community reviews using Socket.IO
- Add and remove favourite games
- View all community reviews
- Explore statistics through D3.js visualizations
- Navigate the application through Vue Router in a single page interface

## Routes

The application uses hash-based Vue Router paths such as:

- `/#/`
- `/#/reviews`
- `/#/stats`
- `/#/favourites`
- `/#/game/123`

## Tech Stack

* Backend: Node.js, Express.js, Socket.IO, SQLite3
* Frontend: HTML, CSS, JavaScript, Vue.js, Vue Router, Bootstrap, Socket.IO Client, D3.js
* Game Data Source: RAWG
* Local Database: SQLite3

## How to Run

1. Open a terminal.
2. Navigate to the `server` folder.
3. Run `npm install`.
4. Run `npm start`.
5. Open your browser and go to `http://localhost:3000`.

## Project Notes

* The frontend was refactored into a single page application using Vue Router.
* Navigation is handled dynamically through routed Vue components.
* A shared NavBar component is used across the application.
* SQLite3 is used as the local database to store game, review, and favourite data.
* D3.js is used to generate charts and support data visualization on the statistics page.
* The `rawg.py` script was updated to import additional game information, including images and other metadata.
* Adult games were manually reviewed and removed from the dataset where identified.
* The application includes a working favourites system for saving and removing games.

## Pages

* **Home Page**: browse and search for games
* **Game Detail Page**: view game information, reviews, and add or remove favourites
* **All Reviews Page**: see reviews from all users
* **Statistics Dashboard**: view charts for release years, monthly trends, and rating distribution
* **Favourites Page**: view and manage saved favourite games
