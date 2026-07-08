# RoadShare — Peer-to-Peer Car Rental Marketplace

A full-stack web application connecting car owners with customers who want to rent vehicles for personal or business use. Built as the capstone project for Web Programming II.

## Description

RoadShare is a two-sided marketplace with three user roles:

- **Customers** browse and search available cars by location, price, and vehicle type, submit booking requests, and leave reviews after completed rentals.
- **Car Owners** list vehicles, manage availability, approve or reject incoming booking requests, and view their rental history.
- **Admins** oversee the platform: manage user accounts, moderate listings, and moderate reviews.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** Vanilla HTML, CSS, JavaScript (no framework)
- **Database:** PostgreSQL
- **Auth:** JWT (JSON Web Tokens), bcrypt password hashing
- **Logging:** Morgan (HTTP request logging)
- **Architecture:** MVC (Models / Controllers / Routes on the backend, static pages + fetch-based API calls on the frontend)

## Project Structure

```
car-rental-marketplace/
├── backend/
│   ├── config/db.js          # PostgreSQL connection pool
│   ├── middleware/            # auth.js (JWT verification), roles.js (RBAC), logger.js
│   ├── models/                 # Direct DB queries (users, cars, bookings, reviews)
│   ├── controllers/           # Business logic
│   ├── routes/                  # Express route definitions
│   ├── db/schema.sql          # Full DDL (see below)
│   ├── seedAdmin.js           # One-time script to create the admin account
│   └── server.js
├── frontend/
│   ├── index.html, login.html, register.html, car-details.html
│   ├── customer-dashboard.html, owner-dashboard.html, admin-dashboard.html
│   ├── css/style.css
│   └── js/                      # api.js (fetch wrapper), auth.js, and one file per page
└── README.md
```

## Database Schema & DDL

The full DDL script is at [`backend/db/schema.sql`](backend/db/schema.sql).

**Tables:** `users`, `cars`, `bookings`, `reviews`

**Key design decisions:**
- `users.role` is a Postgres `ENUM` (`customer`, `owner`, `admin`) enforced at the database layer.
- `cars.is_removed` implements soft-delete, preserving booking/review history even after a listing is taken down.
- `reviews.booking_id` has a `UNIQUE` constraint, enforcing one review per completed booking at the database level.
- Foreign keys use `ON DELETE CASCADE` to prevent orphaned rows.

## Setup & Run Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v13+)

### 1. Clone the repository
```bash
git clone https://github.com/fed-cyber/car-rental-marketplace.git
cd car-rental-marketplace
```

### 2. Set up the database
```bash
psql -U postgres
CREATE DATABASE car_rental_db;
\c car_rental_db
\i backend/db/schema.sql
```

### 3. Configure environment variables
Create `backend/.env`:
```
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=car_rental_db
JWT_SECRET=your_own_random_secret
JWT_EXPIRES_IN=2h
```

### 4. Install backend dependencies and start the server
```bash
cd backend
npm install
node seedAdmin.js
node server.js
```
The server runs on `http://localhost:5000`.

Default admin credentials (created by `seedAdmin.js`):
- Email: `admin@roadshare.com`
- Password: `AdminPass123`

### 5. Run the frontend
The frontend is static HTML/CSS/JS — no build step required. From the `frontend/` folder, open `index.html` directly in a browser, or serve it locally (recommended, to avoid `file://` CORS quirks):
```bash
cd frontend
npx serve .
```
Then visit the printed local URL (e.g. `http://localhost:3000`).

## Security Features

- Passwords hashed with **bcrypt** (never stored in plain text)
- **JWT**-based stateless authentication
- **Role-based access control** enforced server-side via middleware (not just hidden UI elements)
- Parameterized SQL queries throughout (prevents SQL injection)
- Ownership checks on update/delete operations (an owner can only modify their own listings/bookings)
- Generic "invalid email or password" login errors (doesn't leak which emails are registered)

## Features Beyond Course Scope

- Booking date-overlap prevention using PostgreSQL's `OVERLAPS` operator
- Soft-delete pattern for listings to preserve historical booking/review integrity
- HTTP request logging via Morgan
- Dedicated seed script for privileged (admin) account creation, kept outside the public registration flow

## Author

[fedhasa dawit]