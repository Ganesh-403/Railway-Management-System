# RailExp - Modern Railway Management System

**RailExp** is a fully modernized, high-performance, and visually premium Railway Management System. Re-engineered from a legacy Flask/HTML app into a modern multi-tier application, it features a **FastAPI** backend, a **Vite React + TailwindCSS** Single Page Application (SPA) frontend, and a containerized **Docker** setup.

---

## 🛠️ Features

### User Experience & Booking
- **Interactive SVG Coach Seat Selector**: Visualizes a standard 40-seat coach map (divided into bays with Aisle separation). Checks seat occupancy in real-time from the database and disables occupied seats (red), allowing users to select exact seat numbers.
- **Itemized Catering Menu**: Passengers can choose individual meal plans (Veg Thali, Non-Veg Thali, Snack Box, Beverage) with dynamic, real-time price calculations in the booking summary cart.
- **Secure JWT Authentication & RBAC**: Fully-featured JWT tokens for login/auth sessions. Implements a hybrid Bcrypt checking mechanism ensuring compatibility with legacy database plain-text passwords.
- **Ticket Bookings & Cancellation**: Confirms bookings, sends emails via non-blocking thread-pool `BackgroundTasks`, and reclaims general seats automatically on cancellation.
- **Live Running Status**: Real-time status lookup identifying whether a train is running, crossed specific stations, completed, or not yet started.

### Administrative Control
- **Recharts Analytics Dashboard**: Rich data visualizations for administrators, including:
  - *Daily Booking Revenue*: Interactive Line Chart.
  - *Service Performance*: Bar Chart of booking counts by train.
  - *Quota Split*: Pie Chart dividing General vs. Tatkal tickets.
  - *Catering metrics*: Pie Chart breaking down catering preferences.
- **Train Schedule CRUD Manager**: Create, Read, Update, and Delete train details (operating days, source/destination, halts, and departure/arrival times).
- **Route Stop Builder**: Dynamic panels to add intermediate route stops for operating train schedules.
- **Ticket Inventory Releases**: Set of admin options to release and copy seat tables for specific dates.

---

## 📂 Project Structure

- **[`backend/`](file:///d:/B.E.%20in%20CE/TE/TE%20Mini%20Project/Railway%20Management%20System/backend)**:
  - `app/main.py`: REST API endpoints, JWT security layers, and core logic.
  - `app/models.py`: SQLAlchemy database models (mapped to MySQL database tables).
  - `app/schemas.py`: Pydantic schemas validating input payloads.
  - `app/auth.py`: Token signing, decoding, and Hybrid Bcrypt validator.
  - `alembic/`: Database schema migrations configuration.
- **[`frontend/`](file:///d:/B.E.%20in%20CE/TE/TE%20Mini%20Project/Railway%20Management%20System/frontend)**:
  - `src/App.jsx`: State-based client router, user state, and auth configurations.
  - `src/pages/`: Page templates (Home, Login, AdminLogin, Register, Search, Booking, TicketView, Cancel, RunningStatus, AdminRights).
  - `src/config.js` / `src/index.css`: API base endpoints and Tailwind design systems.
- **[`legacy/`](file:///d:/B.E.%20in%20CE/TE/TE%20Mini%20Project/Railway%20Management%20System/legacy)**: Holds the historical Flask backend (`web.py`) and raw HTML templates directory for reference.
- **[`docker-compose.yml`](file:///d:/B.E.%20in%20CE/TE/TE%20Mini%20Project/Railway%20Management%20System/docker-compose.yml)**: Unified container deployment configuration.

---

## 🚀 Installation & Setup

### Option A: Using Docker (Recommended)
Ensure Docker and Docker Compose are installed, then run the following in the project root:
```bash
docker-compose up --build
```
- **React Frontend**: `http://localhost` (Port 80)
- **FastAPI Backend**: `http://localhost:8000`
- **MySQL Database**: `http://localhost:3306`

### Option B: Local Bare-Metal Setup

#### 1. Setup the Database
Ensure a local MySQL instance is running, create a database named `Railway`, and load the schema:
```bash
mysql -u root -p Railway < Railway_database.sql
```

#### 2. Start the Backend API
Navigate to the `backend/` directory, set up your `.env` variables, and start the development server:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The API documentation will be available at `http://localhost:8000/docs`.

#### 3. Start the Frontend client
Navigate to the `frontend/` directory, install packages, and boot Vite:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📋 Requirements
- **Database**: MySQL 8.0+
- **Backend**: Python 3.10+ (FastAPI, SQLAlchemy, PyJWT, Cryptography, Pydantic, Bcrypt, PyMySQL, Alembic)
- **Frontend**: Node.js 18+ (React, Vite, TailwindCSS, Lucide React, Recharts)

---

## 🛡️ License

This project is licensed under the **MIT License**.
