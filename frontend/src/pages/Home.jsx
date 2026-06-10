import React from "react";
import { Search, Compass, Calendar, ArrowRight, ShieldCheck, Clock, Award } from "lucide-react";

export default function Home({ setView, user, admin }) {
  const announcements = [
    { id: 1, title: "Special Shatabdi Fares Released", date: "June 09, 2026", text: "Special AC Chair Car fares have been updated for the summer rush on Shatabdi Express services between Mumbai Central and Ahmedabad." },
    { id: 2, title: "Monsoon Schedule Revisions", date: "June 05, 2026", text: "Due to predicted heavy rainfall, speed limits are adjusted on the Konkan Railway section. Kindly check running status before travel." },
    { id: 3, title: "E-Catering Service Improvements", date: "May 28, 2026", text: "Special meal bookings on Rajdhani services are now fully automated and check time tables for precise dinner / breakfast inclusion." }
  ];

  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto w-full py-6">
      {/* Hero Header */}
      <section className="text-center flex flex-col items-center gap-6 py-10 relative overflow-hidden rounded-2xl p-6 bg-gradient-to-b from-gray-900/40 to-transparent border border-gray-800/40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white max-w-3xl leading-tight">
          Experience Seamless <br />
          <span className="gradient-text">Railway Ticket Booking</span>
        </h1>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl">
          Search train schedules, check seat counts, customize catering services, and manage your travel instantly with the next-generation RailExp portal.
        </p>

        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {admin ? (
            <button 
              onClick={() => setView("adminrights")} 
              className="gradient-bg gradient-hover text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-amber-900/30 transition-all hover:scale-[1.02]"
            >
              Go to Admin Dashboard <ArrowRight size={18} />
            </button>
          ) : user ? (
            <button 
              onClick={() => setView("search")} 
              className="gradient-bg gradient-hover text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-amber-900/30 transition-all hover:scale-[1.02]"
            >
              Book Train Tickets <ArrowRight size={18} />
            </button>
          ) : (
            <>
              <button 
                onClick={() => setView("login")} 
                className="gradient-bg gradient-hover text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-amber-900/30 transition-all hover:scale-[1.02]"
              >
                Log In to Book
              </button>
              <button 
                onClick={() => setView("register")} 
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Register Account
              </button>
            </>
          )}
        </div>
      </section>

      {/* Main Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 border border-gray-800 transition-all hover:border-gray-700 hover:translate-y-[-2px]">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg w-fit">
            <Search size={22} />
          </div>
          <h3 className="text-lg font-bold text-white">Search Trains</h3>
          <p className="text-sm text-gray-400">Query schedules, verify seat matrices, and inspect class pricing matrices instantly.</p>
          <button 
            onClick={() => user ? setView("search") : setView("login")} 
            className="text-amber-500 hover:text-amber-400 font-semibold text-sm flex items-center gap-1 mt-auto"
          >
            Go to Search <ArrowRight size={14} />
          </button>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 border border-gray-800 transition-all hover:border-gray-700 hover:translate-y-[-2px]">
          <div className="p-3 bg-fuchsia-500/10 text-fuchsia-500 rounded-lg w-fit">
            <Compass size={22} />
          </div>
          <h3 className="text-lg font-bold text-white">Check Live Status</h3>
          <p className="text-sm text-gray-400">Track current location details and arrival times for operating train schedules.</p>
          <button 
            onClick={() => setView("runningstatus")} 
            className="text-fuchsia-500 hover:text-fuchsia-400 font-semibold text-sm flex items-center gap-1 mt-auto"
          >
            Check Status <ArrowRight size={14} />
          </button>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 border border-gray-800 transition-all hover:border-gray-700 hover:translate-y-[-2px]">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg w-fit">
            <Calendar size={22} />
          </div>
          <h3 className="text-lg font-bold text-white">Cancel Reservations</h3>
          <p className="text-sm text-gray-400">Cancel tickets, verify PNR booking statuses, and reclaim seat values.</p>
          <button 
            onClick={() => user ? setView("cancel") : setView("login")} 
            className="text-rose-500 hover:text-rose-400 font-semibold text-sm flex items-center gap-1 mt-auto"
          >
            Manage Ticket <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Announcements / Travel Updates */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
          <Clock className="text-amber-500" size={20} />
          <h2 className="text-xl font-bold text-white">Latest Announcements & Travel Updates</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="glass-panel p-5 rounded-lg border border-gray-800/80 flex flex-col gap-2">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h4 className="text-md font-semibold text-amber-500">{ann.title}</h4>
                <span className="text-xs text-gray-500">{ann.date}</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{ann.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center border-t border-gray-850 pt-8 mt-4">
        <div className="flex flex-col items-center gap-2">
          <ShieldCheck className="text-amber-500" size={28} />
          <span className="text-sm font-semibold text-white">Secured Transactions</span>
          <span className="text-xs text-gray-500">256-bit encryption for payment validation</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Award className="text-fuchsia-500" size={28} />
          <span className="text-sm font-semibold text-white">Official Data Source</span>
          <span className="text-xs text-gray-500">Synced directly with centralized railway DB</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Clock className="text-rose-500" size={28} />
          <span className="text-sm font-semibold text-white">Instant Refunds</span>
          <span className="text-xs text-gray-500">Cancellation refunds processed instantly</span>
        </div>
      </section>
    </div>
  );
}
