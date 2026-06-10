import React, { useState } from "react";
import { API_BASE } from "../config";
import { Train, Calendar, AlertTriangle, ArrowLeft, Search, CheckCircle, Clock, Navigation } from "lucide-react";

export default function RunningStatus({ setView }) {
  const [trainNo, setTrainNo] = useState("");
  const [date, setDate] = useState("");
  
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    setError("");
    setStatus(null);

    if (!trainNo || !date) {
      setError("Please select both a train number and a date.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/runningstatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          running: parseInt(trainNo),
          Date: date
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Running status query failed");
      }
      setStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto flex flex-col gap-6">
      <button onClick={() => setView("home")} className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1.5 w-fit">
        <ArrowLeft size={16} /> Back to Home
      </button>

      {/* Query Bar */}
      <div className="glass-panel p-6 rounded-xl border border-gray-800 shadow-xl">
        <h2 className="text-xl font-bold text-white font-black mb-4">Check Live Train Running Status</h2>
        <form onSubmit={handleCheckStatus} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Train Number</label>
            <input
              type="number"
              value={trainNo}
              onChange={(e) => setTrainNo(e.target.value)}
              placeholder="e.g. 12009"
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Journey Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="text-white font-semibold px-6 py-2.5 rounded-lg gradient-bg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 text-sm h-fit disabled:opacity-50"
          >
            <Search size={16} /> {loading ? "Querying..." : "Locate Train"}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-lg flex items-center gap-2 text-sm max-w-md mx-auto w-full">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stepper Timeline Panel */}
      {status && (
        <div className="glass-panel p-6 rounded-xl border border-gray-800 shadow-xl flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-gray-800 pb-3 flex-wrap gap-4">
            <div>
              <h3 className="text-md font-bold text-white">Live Tracking: Train {trainNo}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Checked Date: {date}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${
              status.status === "running" 
                ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-300 animate-pulse"
                : "bg-gray-900 border-gray-800 text-gray-400"
            }`}>
              {status.status === "running" ? "In Transit" : status.status.replace("_", " ")}
            </span>
          </div>

          {/* Stepper Visuals */}
          <div className="flex flex-col gap-6 items-center py-6 text-center">
            {status.status === "running" ? (
              <div className="flex flex-col items-center gap-6 w-full max-w-md">
                <div className="relative flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white animate-bounce shadow-lg shadow-amber-900/30">
                    <Navigation size={22} className="rotate-45" />
                  </div>
                  <div className="w-1 h-16 bg-gradient-to-b from-amber-500 to-gray-800"></div>
                  <div className="w-4 h-4 rounded-full bg-gray-800 border-2 border-gray-700"></div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-amber-500 font-bold uppercase tracking-widest">Current Position</span>
                  <h4 className="text-xl font-black text-white">CROSSED {status.crossed}</h4>
                  <p className="text-sm text-gray-400">
                    Approaching <span className="font-semibold text-white">{status.arriving}</span>
                  </p>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-850">
                    <Clock size={12} /> Expected Arrival: {status.arrival_time}
                  </p>
                </div>
              </div>
            ) : status.status === "completed" ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle size={24} />
                </div>
                <h4 className="text-lg font-bold text-white">Journey Completed</h4>
                <p className="text-xs text-gray-400 max-w-xs">{status.message}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500">
                  <Train size={22} />
                </div>
                <h4 className="text-lg font-bold text-white">Service Suspended / Scheduled</h4>
                <p className="text-xs text-gray-400 max-w-xs">{status.message}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
