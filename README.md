# TheFoodCourt


## Overview
TheFoodCourt is a full-stack web application for managing a digital food court experience. It allows restaurant owners to manage their outlets, menus, reservations, and orders, while customers can browse restaurants, make reservations, and place orders online.

## Features
### Owner Capabilities
- Register and log in as a restaurant owner
- View and manage their restaurants
- Create and manage menus for each restaurant
- View reservations made by customers for their restaurants
- View orders made for their restaurants (including meals ordered)

### Customer Capabilities
- Register and log in as a customer
- View available restaurants and menus
- Make reservations for tables
- Place orders from the menu
- View previous orders and reservations.

## Tech Stack
- **Backend:** Python, Flask, SQLAlchemy, Flask-JWT-Extended, Flask-Migrate, Flask-CORS
- **Frontend:** React, Bootstrap, Axios
- **Database:** SQLite (default, can be swapped for PostgreSQL/MySQL)

## Entity Relationship Diagram (ERD)

- View the ERD online: [dbdiagram.io link](https://dbdiagram.io/d/Copy-of-Untitled-Diagram-68774540f413ba35081948c9)

![ERD Diagram] <img width="1322" height="825" alt="Screenshot from 2025-07-28 13-49-06" src="https://github.com/user-attachments/assets/f0b60d8d-205e-4019-b270-abd6481814cc" />


## Project Structure
```
TheFoodCourt/
├── frontend
│   ├── db.json
│   ├── package.json
│   ├── package-lock.json
│   ├── public
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── logo.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── README.md
│   └── src
│       ├── App.css
│       ├── App.js
│       ├── App.test.js
│       ├── components
│       ├── contexts
│       ├── index.css
│       ├── index.js
│       ├── logo.svg
│       ├── pages
│       ├── reportWebVitals.js
│       ├── services
│       └── setupTests.js
├── image-1.png
├── image.png
├── instance
├── package-lock.json
├── Pipfile
├── Pipfile.lock
├── README.md
├── server
│   ├── app.py
│   ├── instance
│   ├── migrations
│   │   ├── alembic.ini
│   │   ├── env.py
│   │   ├── README
│   │   ├── script.py.mako
│   │   └── versions
│   ├── models.py
│   ├── reservation_utils.py
│   ├── routes
│   │   ├── dashboard.py
│   │   ├── meals.py
│   │   ├── menus.py
│   │   ├── orders.py
│   │   ├── reservations.py
│   │   ├── restaurants.py
│   │   ├── tables.py
│   │   └── users.py
│   ├── seed.py
│   ├── test_orders.py
│   ├── test_stats.py
│   └── update_db_schema.py

```