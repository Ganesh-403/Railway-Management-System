# Railway Management System

The **Railway Management System** is a comprehensive web-based application designed to streamline and manage the essential functionalities of a railway system. This system facilitates user-friendly interactions for passengers, administrators, and other stakeholders, ensuring a seamless railway experience.

---

## 🛠️ Features

### User Features
- **Passenger Registration and Login**: Secure registration and login for passengers.
- **Ticket Booking**: Reserve tickets for train journeys.
- **Ticket Cancellation**: Cancel existing reservations with ease.
- **Search Trains**: Find trains by route, timing, or availability.
- **Running Status**: Check the real-time status of trains.
- **Travel Updates**: Stay updated with important travel notifications.
- **Privacy Policy**: View the privacy and terms of service.

### Admin Features
- **Admin Login**: Secure login for administrators.
- **Passenger Management**: Access and manage passenger details.
- **Train Management**: Add, update, or remove train schedules.
- **Reports and Insights**: Generate reports for cancellations, bookings, and other activities.

---

## 📂 Project Structure

### **Frontend (HTML Templates)**
The user interface is built with HTML and includes the following templates:
- **Home Page** (`home.html`): Overview of the system.
- **Login/Registration**: 
  - `login.html`
  - `registration1.html`, `registration2.html`, `registration3.html`
- **Ticketing System**: 
  - `ticket.html` (Booking)
  - `cancel.html` (Cancellation)
- **Admin Controls**: 
  - `adminlogin.html`
  - `adminrights.html`
- **Passenger Details**: `passengers.html`
- **Travel Updates and Running Status**: 
  - `travelupdates.html`
  - `runningstatus.html`
- **Privacy and T&C**: 
  - `privacypolicy.html`
  - `t&c.html`

### **Backend (Python)**
- **`web.py`**: Backend logic to handle requests, manage user data, and process ticket bookings.

### **Database**
- **Schema**: `Railway.mwb`
- **SQL Data**: `Railway_database.sql`
  - Tables for passengers, tickets, train schedules, admins, etc.
  - Preloaded data for testing and demonstration.

---

## 🚀 Installation and Setup

1. **Clone the Repository**
   ```
   git clone https://github.com/Ganesh-403/Railway-Management-System.git
2. **Set Up the Database**

   - Import `Railway_database.sql` into your MySQL or SQLite environment.
   - Ensure the connection details in `web.py` match your database setup.

3. **Run the Backend**

   - Install the necessary Python libraries:
     ```
     pip install flask mysql-connector
     ```
   - Start the server:
     ```
     python web.py
     ```

4. **Access the Application**

   - Open your browser and navigate to `http://localhost:5000`.

---

## 📋 Requirements

### Software
- MySQL or SQLite for the database.
- Python 3.8+ with Flask framework.

### Dependencies
- Flask
- MySQL-Connector or SQLite3

---

## 📸 Screenshots

Include images/screenshots of your application for visual representation:
- Home Page
- Ticket Booking Page
- Admin Dashboard

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repository and create a pull request with your changes.

---

## 🛡️ License

This project is licensed under the **MIT License**.
