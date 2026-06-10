import React, { useState, useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Booking from "./pages/Booking";
import TicketView from "./pages/TicketView";
import Cancel from "./pages/Cancel";
import RunningStatus from "./pages/RunningStatus";
import AdminRights from "./pages/AdminRights";
import { TermsPage, PrivacyPage } from "./pages/InfoPages";
import { Train, User, LogOut, ShieldAlert, BookOpen, HelpCircle, PhoneCall, Info } from "lucide-react";

export default function App() {
  const [view, setView] = useState("home");
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [bookingParams, setBookingParams] = useState(null);
  const [ticketData, setTicketData] = useState(null);

  // Load user/admin state from localStorage on init
  useEffect(() => {
    const storedUser = localStorage.getItem("rail_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("rail_user");
      }
    }
    const storedAdmin = localStorage.getItem("rail_admin");
    if (storedAdmin) {
      setAdmin(storedAdmin);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("rail_user");
    setUser(null);
    setView("home");
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("rail_admin");
    setAdmin(null);
    setView("home");
  };

  const navigateToBooking = (params) => {
    setBookingParams(params);
    setView("booking");
  };

  const navigateToTicket = (data) => {
    setTicketData(data);
    setView("ticket");
  };

  // View routing handler
  const renderView = () => {
    switch (view) {
      case "home":
        return <Home setView={setView} user={user} admin={admin} />;
      case "login":
        return <Login setView={setView} setUser={setUser} />;
      case "adminlogin":
        return <AdminLogin setView={setView} setAdmin={setAdmin} />;
      case "register":
        return <Register setView={setView} />;
      case "search":
        return <Search setView={setView} navigateToBooking={navigateToBooking} user={user} />;
      case "booking":
        return <Booking setView={setView} bookingParams={bookingParams} navigateToTicket={navigateToTicket} user={user} />;
      case "ticket":
        return <TicketView setView={setView} ticketData={ticketData} user={user} />;
      case "cancel":
        return <Cancel setView={setView} user={user} />;
      case "runningstatus":
        return <RunningStatus setView={setView} />;
      case "adminrights":
        return admin ? <AdminRights setView={setView} admin={admin} handleAdminLogout={handleAdminLogout} /> : <AdminLogin setView={setView} setAdmin={setAdmin} />;
      case "tc":
        return <TermsPage setView={setView} />;
      case "privacy":
        return <PrivacyPage setView={setView} />;
      default:
        return <Home setView={setView} user={user} admin={admin} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-gray-200 flex flex-col font-sans">
      {/* Dynamic Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-gray-800 shadow-xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView("home")}>
            <div className="p-2 gradient-bg rounded-lg text-white">
              <Train size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Rail<span className="gradient-text font-black">Exp</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button onClick={() => setView("home")} className="hover:text-amber-500 transition-colors">Home</button>
            <button onClick={() => setView("runningstatus")} className="hover:text-amber-500 transition-colors">Running Status</button>
            <button onClick={() => setView("tc")} className="hover:text-amber-500 transition-colors">Terms</button>
            <button onClick={() => setView("privacy")} className="hover:text-amber-500 transition-colors">Privacy</button>
            <button 
              onClick={() => {
                alert("Customer Care: 0763-6612461, 0763-4090840\nCancellations: tc@railexp.co.in\nQueries: queries@railexp.co.in");
              }} 
              className="hover:text-amber-500 transition-colors flex items-center gap-1"
            >
              <PhoneCall size={14} /> Contact
            </button>
          </nav>

          <div className="flex items-center gap-4">
            {admin ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-800/40 flex items-center gap-1">
                  <ShieldAlert size={12} /> Admin: {admin}
                </span>
                <button onClick={() => setView("adminrights")} className="text-sm font-semibold hover:text-amber-500 transition-colors">Dashboard</button>
                <button 
                  onClick={handleAdminLogout}
                  className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Logout Admin"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                  <User size={16} className="text-amber-500" /> {user.firstName}
                </span>
                <button onClick={() => setView("search")} className="text-sm font-semibold text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors border border-gray-700">Search Trains</button>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-rose-400 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => setView("login")} className="text-sm font-semibold text-gray-300 hover:text-white px-3 py-1.5 transition-colors">Login</button>
                <button onClick={() => setView("register")} className="text-sm font-semibold text-white gradient-bg hover:opacity-90 px-4 py-2 rounded-lg shadow-lg shadow-amber-900/30 transition-all">Register</button>
                <button onClick={() => setView("adminlogin")} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Admin</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center">
        {renderView()}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#05070d] py-6 text-center text-xs text-gray-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} RailExp. Built as CE Mini Project. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setView("tc")} className="hover:underline">Terms & Conditions</button>
            <button onClick={() => setView("privacy")} className="hover:underline">Privacy Policy</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
