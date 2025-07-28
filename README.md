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
- View previous orders and reservations

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
├── server/
│   ├── app.py
│   ├── models.py
│   ├── routes/
│   ├── migrations/
│   ├── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── ...
├── instance/
│   └── foodcourt.db
├── Pipfile
├── README.md
```

## Setup Instructions

### Backend
1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run database migrations:
   ```bash
   flask db upgrade
   ```
4. Start the backend server:
   ```bash
   python server/app.py
   ```
   The backend runs on `http://localhost:5555` by default.

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm start
   ```
   The frontend runs on `http://localhost:3000` by default.

## API Endpoints (Sample)
- `/users/register/customer` - Register a new customer
- `/users/register/owner` - Register a new owner and restaurant
- `/users/login/customer` - Customer login
- `/users/login/owner` - Owner login
- `/restaurants` - List all restaurants
- `/menus` - List all menus
- `/meals` - List all meals
- `/reservations` - Make/view reservations
- `/orders` - Place/view orders

## Development Notes
- Use relative URLs in the frontend for API requests to leverage the proxy and avoid CORS issues.
- JWT tokens are used for authentication; they are stored in localStorage after login.
- Database migrations are managed with Flask-Migrate/Alembic.

## Contributing
Pull requests are welcome! Please open an issue first to discuss major changes.

## License
MIT
