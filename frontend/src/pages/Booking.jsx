import React, { useState, useEffect } from "react";
import { API_BASE } from "../config";
import { User, AlertTriangle, ArrowLeft, Plus, Check } from "lucide-react";

export default function Booking({ setView, bookingParams, navigateToTicket, user }) {
  if (!bookingParams || !user) {
    return (
      <div className="text-center py-12 glass-panel rounded-xl max-w-md mx-auto border border-gray-800">
        <AlertTriangle className="text-amber-500 mx-auto mb-3" size={32} />
        <h4 className="text-md font-semibold text-white">Booking parameters missing</h4>
        <button onClick={() => setView("search")} className="mt-4 text-sm text-amber-500 hover:underline">
          Return to search
        </button>
      </div>
    );
  }

  const { trainno, trainname, price, category, seats, type, date, startstation, endstation } = bookingParams;

  const [ticketCount, setTicketCount] = useState(1);
  const [passengers, setPassengers] = useState([{ name: "", gender: "Male", foodtype: "No", age: "" }]);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Synchronize passenger input forms with ticketCount
  useEffect(() => {
    const diff = ticketCount - passengers.length;
    if (diff > 0) {
      // Add fields
      const newFields = Array(diff).fill(null).map(() => ({ name: "", gender: "Male", foodtype: "No", age: "" }));
      setPassengers([...passengers, ...newFields]);
    } else if (diff < 0) {
      // Trim fields
      setPassengers(passengers.slice(0, ticketCount));
    }
  }, [ticketCount]);

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate inputs
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name || !p.age) {
        setError(`Please fill in Name and Age for passenger ${i + 1}.`);
        setLoading(false);
        return;
      }
      if (parseInt(p.age) <= 0 || parseInt(p.age) > 120) {
        setError(`Invalid age value for passenger ${i + 1}.`);
        setLoading(false);
        return;
      }
    }

    try {
      const url = new URL(`${API_BASE}/api/book`);
      url.searchParams.append("trainno", trainno.toString());
      url.searchParams.append("price", price.toString());
      url.searchParams.append("category", category);
      url.searchParams.append("seats", seats.toString());
      url.searchParams.append("type", type);
      url.searchParams.append("date", date);
      url.searchParams.append("startstation", startstation);
      url.searchParams.append("endstation", endstation);
      url.searchParams.append("username", user.username);

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tickets: ticketCount,
          passengers: passengers.map(p => ({
            name: p.name,
            gender: p.gender,
            foodtype: p.foodtype,
            age: parseInt(p.age)
          }))
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Booking failed");
      }

      navigateToTicket(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto flex flex-col gap-6">
      <button onClick={() => setView("search")} className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1.5 w-fit">
        <ArrowLeft size={16} /> Back to Train Search
      </button>

      {/* Summary Banner */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex justify-between items-center flex-wrap gap-4 bg-gradient-to-r from-gray-900/50 to-transparent">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
            Class {category} • {type} Quota
          </span>
          <h2 className="text-lg font-bold text-white mt-1.5">{trainname} ({trainno})</h2>
          <p className="text-xs text-gray-400 mt-1">{startstation} &rarr; {endstation} on {date}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">Base Price per Ticket</span>
          <h3 className="text-xl font-black text-white">INR {price}</h3>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-lg flex items-center gap-2 text-sm">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Ticket Count selector */}
        <div className="glass-panel p-6 rounded-xl border border-gray-800 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Number of Passengers</h3>
            <p className="text-xs text-gray-500 mt-0.5">Define seats to allocate for this journey (max 6)</p>
          </div>
          <select
            value={ticketCount}
            onChange={(e) => setTicketCount(parseInt(e.target.value))}
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500 text-sm font-bold"
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? "Seat" : "Seats"}</option>
            ))}
          </select>
        </div>

        {/* Dynamic Passenger list */}
        <div className="flex flex-col gap-4">
          {passengers.map((p, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col gap-4 relative">
              <div className="absolute top-4 right-4 text-xs font-black text-gray-700"># {idx + 1}</div>
              <h4 className="text-sm font-bold text-amber-500 flex items-center gap-1.5">
                <User size={16} /> Passenger {idx + 1}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs text-gray-400">Full Name</label>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => handlePassengerChange(idx, "name", e.target.value)}
                    placeholder="Enter name"
                    className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm placeholder-gray-600"
                    required
                  />
                </div>

                {/* Age */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Age</label>
                  <input
                    type="number"
                    value={p.age}
                    onChange={(e) => handlePassengerChange(idx, "age", e.target.value)}
                    placeholder="Age"
                    className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm placeholder-gray-600"
                    required
                  />
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Gender</label>
                  <select
                    value={p.gender}
                    onChange={(e) => handlePassengerChange(idx, "gender", e.target.value)}
                    className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {/* Food service selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 border-t border-gray-850 pt-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-semibold">Dining / Food Preference</label>
                  <span className="text-[10px] text-gray-500">Catering computed based on route timetable hours</span>
                </div>
                <div className="flex gap-4">
                  {["No", "Veg", "NVeg"].map(opt => (
                    <label key={opt} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                      <input
                        type="radio"
                        name={`food-${idx}`}
                        value={opt}
                        checked={p.foodtype === opt}
                        onChange={() => handlePassengerChange(idx, "foodtype", opt)}
                        className="accent-amber-500 focus:ring-0 focus:outline-none"
                      />
                      {opt === "No" ? "No Food" : opt === "Veg" ? "Veg Meals" : "Non-Veg Meals"}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Total aggregation card */}
        <div className="glass-panel p-6 rounded-xl border border-gray-800 flex justify-between items-center bg-gray-950/40">
          <div>
            <h4 className="text-md font-bold text-white">Estimated Tickets Price</h4>
            <p className="text-xs text-gray-500 mt-1">Catering surcharges calculated upon reservation validation</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">Subtotal ({ticketCount} ticket{ticketCount > 1 ? "s" : ""})</span>
            <h3 className="text-2xl font-black text-amber-500 mt-0.5">INR {price * ticketCount} <span className="text-xs font-medium text-gray-400">+ catering</span></h3>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-lg gradient-bg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 text-base"
        >
          {loading ? "Confirming Reservation..." : "Confirm & Book Ticket"} <Check size={18} />
        </button>
      </form>
    </div>
  );
}
