import React, { useState } from "react";
import { API_BASE } from "../config";
import { Calendar, Trash2, ShieldAlert, AlertTriangle, ArrowLeft, Search, CheckCircle } from "lucide-react";

export default function Cancel({ setView, user }) {
  const [pnr, setPnr] = useState("");
  const [ticketInfo, setTicketInfo] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleCheckPNR = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setTicketInfo(null);

    if (!pnr) {
      setError("Please enter a valid PNR number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/pnr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ PNR: parseInt(pnr) })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to retrieve PNR details");
      }
      setTicketInfo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async () => {
    if (!ticketInfo) return;
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/cancel?username=${user.username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ PNR: ticketInfo.pnr })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Cancellation failed");
      }
      setSuccessMsg(data.message || "Ticket cancelled successfully!");
      // Reload ticket info
      const reloadRes = await fetch(`${API_BASE}/api/pnr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ PNR: ticketInfo.pnr })
      });
      const reloadData = await reloadRes.json();
      setTicketInfo(reloadData);
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

      {/* Search Bar */}
      <div className="glass-panel p-6 rounded-xl border border-gray-800 shadow-xl">
        <h2 className="text-xl font-bold text-white font-black mb-4">Check PNR / Cancel Ticket</h2>
        <form onSubmit={handleCheckPNR} className="flex gap-4 items-end flex-wrap sm:flex-nowrap">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">PNR Reference Number</label>
            <input
              type="number"
              value={pnr}
              onChange={(e) => setPnr(e.target.value)}
              placeholder="e.g. 1"
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="text-white font-semibold px-6 py-2.5 rounded-lg gradient-bg hover:opacity-90 transition-opacity flex items-center gap-1.5 text-sm h-fit shrink-0 disabled:opacity-50"
          >
            <Search size={16} /> {loading ? "Fetching..." : "Retrieve Ticket"}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-lg flex items-center gap-2 text-sm max-w-md mx-auto w-full">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 rounded-lg flex items-center gap-2 text-sm max-w-md mx-auto w-full">
          <CheckCircle size={16} className="shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Ticket Details Panel */}
      {ticketInfo && (
        <div className="glass-panel p-6 rounded-xl border border-gray-800 shadow-xl flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-gray-800 pb-3 flex-wrap gap-4">
            <div>
              <h3 className="text-md font-bold text-white">PNR Details: {ticketInfo.pnr}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{ticketInfo.trainname} ({ticketInfo.trainno})</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
              ticketInfo.passengers[0]?.status === "CNF" 
                ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-300"
                : "bg-rose-950/40 border-rose-800/40 text-rose-300"
            }`}>
              {ticketInfo.passengers[0]?.status === "CNF" ? "Confirmed" : "Cancelled"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-950/30 p-4 rounded-lg">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 font-semibold uppercase">Travel details</span>
              <p className="text-white font-bold">{ticketInfo.boarding} &rarr; {ticketInfo.destination}</p>
              <p className="text-xs text-gray-400">Date of Journey: {ticketInfo.date}</p>
            </div>
            <div className="flex flex-col gap-1 sm:border-l sm:border-gray-850 sm:pl-4">
              <span className="text-xs text-gray-500 font-semibold uppercase">Pricing & Quota</span>
              <p className="text-white font-bold">INR {ticketInfo.price}</p>
              <p className="text-xs text-gray-400">{ticketInfo.category} Class • {ticketInfo.type} Quota</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gray-850 pb-2">Passenger Roster</h4>
            <div className="grid grid-cols-1 gap-2">
              {ticketInfo.passengers.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-900 border border-gray-850 px-4 py-2 rounded-lg text-sm text-gray-300">
                  <span>
                    {idx + 1}. <span className="font-semibold text-white">{p.name}</span> ({p.age}, {p.gender})
                  </span>
                  <span className={`font-bold ${p.status === "CNF" ? "text-emerald-500" : "text-rose-500"}`}>
                    Seat {p.seat} - {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation controls */}
          {ticketInfo.type === "Tatkal" ? (
            <div className="p-4 bg-rose-950/20 border border-rose-900/30 rounded-lg text-xs text-rose-300 flex items-start gap-2">
              <ShieldAlert size={16} className="shrink-0 text-rose-400" />
              <div>
                <span className="font-bold">Cancellation Restriction:</span> Tatkal reservations are strictly non-refundable and cannot be cancelled.
              </div>
            </div>
          ) : ticketInfo.passengers[0]?.status === "CXL" ? (
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-400 text-center">
              This reservation has already been cancelled.
            </div>
          ) : (
            <button
              onClick={handleCancelTicket}
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-lg bg-rose-600 hover:bg-rose-500 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <Trash2 size={16} /> {loading ? "Processing Cancellation..." : "Cancel Reservation (Reclaim Seats)"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
