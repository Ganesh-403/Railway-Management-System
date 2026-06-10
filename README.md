# RailExp - Modern Railway Management System

**RailExp** is a fully modernized, high-performance, and visually premium Railway Management System. Re-engineered from a legacy Python Flask and raw HTML application into a modern multi-tier architecture, it features a highly concurrent **FastAPI** backend, a state-of-the-art **Vite React + TailwindCSS** Single Page Application (SPA) frontend, and a containerized **Docker** development and production cluster.

---

## 📖 Table of Contents
1. [Tech Stack](#-tech-stack)
2. [Key Features](#%EF%B8%8F-key-features)
3. [Architecture & Database Design](#-architecture--database-design)
4. [API Endpoints](#-api-endpoints)
5. [Seating Grid Layout Logic](#-seating-grid-layout-logic)
6. [Installation & Setup](#-installation--setup)
7. [Environment Configurations](#-environment-configurations)
8. [License](#-license)

---

## 💻 Tech Stack

### Backend Service
* **FastAPI**: Core framework utilizing Python's `asyncio` for high-throughput, non-blocking requests.
* **SQLAlchemy 2.0**: Object-Relational Mapper (ORM) using connection pools and explicit database transaction bindings.
* **PyJWT**: Generating and validating cryptographically signed JSON Web Tokens (HS256) for state-free session authentication.
* **Bcrypt**: Hybrid verification system comparing new hashed passwords via bcrypt while falling back to plain-text string matches to secure legacy user accounts.
* **Alembic**: Database schema version control and migrations runner.

### Frontend Client
* **Vite + React SPA**: High-performance module bundler compiling component trees.
* **TailwindCSS**: Sleek modern styling using custom CSS HSL color palettes, responsive flexboxes, micro-animations, and premium dark glassmorphism effects (`.glass-panel`).
* **Recharts**: Declarative React chart components utilizing lightweight SVG nodes for analytics tracking.
* **Lucide React**: Curated, pixel-perfect UI icons vector set.

### Infrastructure & Deployment
* **Docker Multi-stage Builds**: Building small assets inside intermediate Node images and serving static distribution directories on Alpine Nginx.
* **Docker Compose**: Containerized bridge networking linking backend services, frontend servers, and MySQL instances.

---

## 🛠️ Key Features

### User Experience & Booking
* **Interactive SVG Coach Seat Map**: Renders a standard 40-seat coach map inside [Booking.jsx](file:///d:/B.E.%20in%20CE/TE/TE%20Mini%20Project/Railway%20Management%20System/frontend/src/pages/Booking.jsx). Occupied seats are retrieved in real-time from the database and disabled (rendered in red), allowing passengers to click and choose their exact seats.
* **Itemized Catering Menu**: Passengers select dining preferences from a detailed list (Veg Thali - ₹120, Non-Veg Thali - ₹150, Snack Box - ₹40, Beverage - ₹20, or No Food) with real-time aggregated subtotal cost calculations.
* **Multi-step Passenger Registration**: An elegant three-step form wizard tracking account login parameters, personal details, and address records.
* **Live Running Status Tracker**: Cross-checks current local timestamps with route department times, reporting whether a train is running, has crossed a station, completed its journey, or hasn't started yet.

### Administrative Control
* **Recharts Analytics Dashboard**: Modern analytics charts summarizing system rosters:
  * *Daily Booking Revenue*: SVG Area Line chart showing revenue timeline.
  * *Service Performance*: Bar Chart tracking ticket counts per train.
  * *Quota Split*: Pie Chart dividing General vs. Tatkal ticket purchases.
  * *Catering Preferences*: Donut Chart summarizing passenger menu metrics.
* **Train CRUD & Route Managers**: Full GUI forms enabling admins to create new train schedules, edit parameters, delete trains, and define intermediate route stops (station sequence, arrival/departure day indexes, timings).
* **Inventory Release Utility**: Lets admins copy base templates and instantiate general/tatkal ticket counts for target dates.

---

## 📂 Project Structure

```bash
Railway-Management-System/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application, auth routers, CRUD and booking endpoints
│   │   ├── models.py        # SQLAlchemy schema mapping tables (e.g. Userdetails, Traindetails)
│   │   ├── schemas.py       # Pydantic schemas validating input/output JSON payloads
│   │   ├── auth.py          # Session JWT encode/decode & hybrid bcrypt verify
│   │   ├── config.py        # Environment settings loading and SMTP configurations
│   │   └── database.py      # SQLAlchemy connection engine & DB session yield hook
│   ├── alembic/             # Alembic migration configuration and histories
│   ├── requirements.txt     # Python backend dependencies list
│   └── Dockerfile           # Multi-stage FastAPI container build config
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Welcome landing page, announcements, and trust badges
│   │   │   ├── Login.jsx          # User credentials verification page
│   │   │   ├── AdminLogin.jsx     # Admin access gateway
│   │   │   ├── Register.jsx       # Three-step sign-up wizard
│   │   │   ├── Search.jsx         # Station queries, quota selection, and class cards
│   │   │   ├── Booking.jsx        # SVG Seat selectors, catering cart, and checkout
│   │   │   ├── TicketView.jsx     # Confirmed PNR print layout
│   │   │   ├── Cancel.jsx         # Cancellation panel and PNR detail rosters
│   │   │   ├── RunningStatus.jsx  # Route time table status tracker
│   │   │   └── AdminRights.jsx    # Recharts dashboard, release tool, and CRUD forms
│   │   ├── App.jsx          # Client-side router, state storage, and navigation bar
│   │   ├── config.js        # Base URL server endpoints configurations
│   │   └── index.css        # Tailwind variables, fonts, glassmorphism templates
│   ├── package.json         # Node dev libraries (Vite, Recharts, Lucide)
│   └── Dockerfile           # Multi-stage Node builder and Alpine Nginx server
├── legacy/                  # Archived Flask web.py and HTML templates folder
├── docker-compose.yml       # Production-ready compose stack (DB, Backend, Frontend)
├── Railway_database.sql     # Seed script containing default routes, pricing, and train details
└── README.md                # System documentation guide
```

---

## 🗄️ Database Design

The database schema (`Railway`) binds relational constraints between accounts, routes, prices, and tickets:

```mermaid
erDiagram
    Userdetails ||--o{ Ticket : "places"
    Traindetails ||--o{ Route : "runs on"
    Traindetails ||--o{ Ticket : "reserved on"
    Passengerdetails ||--|| Ticket : "assigned to"
    Route ||--o{ Generalrouteprices : "has general price"
    Route ||--o{ Tatkalrouteprices : "has tatkal price"

    Userdetails {
        string ID PK
        string Password
        string Email
        string Firstname
        string Lastname
        string Mobile
    }
    Traindetails {
        int Trainno PK
        string Trainname
        string Traincategory
        string Startstation
        string Endstation
    }
    Route {
        int RouteID PK
        int Trainno FK
        string Deptstation
        string Arrivalstation
        int Stopnumber
    }
    Ticket {
        int PNR PK
        int PassengerID FK
        string ID FK
        int Trainno FK
        string Status
        int Seat
        int Price
        date Date
    }
```

*Note on Variable Overrides: Python variables cannot start with digits. Database columns such as `3Aseats` or `2Aseats` are mapped in [models.py](file:///d:/B.E.%20in%20CE/TE/TE%20Mini%20Project/Railway%20Management%20System/backend/app/models.py) using SQLAlchemy column name mapping:*
```python
AC3_seats = Column("3Aseats", Integer)
AC2_seats = Column("2Aseats", Integer)
```

---

## 📡 API Endpoints

### 🔐 Authentication
* `POST /api/login`: Validates user password (plain or bcrypt) and returns a session JWT.
* `POST /api/admin/login`: Verifies admin password and returns an admin JWT.
* `POST /api/register`: Registers a user.
* `POST /api/check-username`: Checks username availability.

### 🚄 User Operations
* `POST /api/search`: Queries available trains and returns class pricing and list of occupied seats.
* `POST /api/book`: Validates seat selections, catering cost, updates inventory, and generates PNR. Requires **JWT Bearer Token**.
* `POST /api/cancel`: Updates status to `CXL` and reclaims seat availability. Requires **JWT Bearer Token**.
* `POST /api/pnr`: Retrieves ticket details and passenger status.
* `POST /api/runningstatus`: Calculates crossed halts against real-time clocks.

### 🛡️ Admin Controls
* `GET /api/admin/analytics`: Collects daily revenue timelines, bookings count, quotas, and food metrics. Requires **Admin JWT**.
* `POST /api/admin/release`: Copies availability templates for general or tatkal seats on a given date. Requires **Admin JWT**.
* `GET /api/admin/trains`: Retrieves all train details. Requires **Admin JWT**.
* `POST /api/admin/trains`: Creates a new train schedule. Requires **Admin JWT**.
* `PUT /api/admin/trains/{trainno}`: Modifies existing train parameters. Requires **Admin JWT**.
* `DELETE /api/admin/trains/{trainno}`: Deletes a train service. Requires **Admin JWT**.
* `POST /api/admin/routes`: Adds intermediate stops to a train route. Requires **Admin JWT**.

---

## 💺 Seating Grid Layout Logic

A standard coach compartment is composed of 5 bays. Each bay contains 8 berths, numbering **1 to 40** in total. Berths are classified mathematically using a 1-based modulo operation:

| Seat Number % 8 | Berth Classification | Code |
| :--- | :--- | :--- |
| **1** or **4** | Lower Berth | **L** |
| **2** or **5** | Middle Berth | **M** |
| **3** or **6** | Upper Berth | **U** |
| **7** | Side Lower | **SL** |
| **0** (or **8**) | Side Upper | **SU** |

*Interactive selection automatically manages first-in-first-out queue replacements if a user changes their ticket count request.*

---

## 🚀 Installation & Setup

### Option A: Using Docker (Recommended)
Make sure **Docker Desktop** is running, then execute:
```bash
docker-compose up --build
```
* **React Frontend**: [http://localhost:8080](http://localhost:8080) (Port 8080)
* **FastAPI Backend**: [http://localhost:8081](http://localhost:8081) (Port 8081)
* **MySQL Database**: `localhost:3308`

---

### Option B: Local Bare-Metal Setup

#### 1. Setup the Database
Start your local MySQL server on port `3306` and import the schema dump file:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS Railway;"
mysql -u root -p Railway < Railway_database.sql
```

#### 2. Start the Backend API
Navigate to the `backend/` directory, configure the environment variables, install the dependencies, and start the Uvicorn server:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
*The swagger interactive API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).*

#### 3. Start the Frontend client
Open a new terminal session, navigate to the `frontend/` directory, install packages, and boot Vite:
```bash
cd frontend
npm install
npm run dev
```
*Open the local link shown in the output (typically [http://localhost:5173](http://localhost:5173)) in your browser.*

---

## ⚙️ Environment Configurations

Create a `.env` file inside the `backend/` directory with the following variables:

```ini
DATABASE_URL=mysql+pymysql://root:Ganesh%40123@localhost:3306/Railway
SECRET_KEY=super-secret-key-for-development-auth-session

# SMTP Mail Server configurations
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-passcode
MAIL_FROM=your-email@gmail.com
```

---

## 🤝 Contributing
Contributions are welcome! Feel free to fork the repository and open pull requests.

---

## 🛡️ License
This project is licensed under the **MIT License**.
