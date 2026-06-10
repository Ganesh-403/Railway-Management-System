import React, { useState, useEffect } from "react";
import { API_BASE } from "../config";
import { User, AlertTriangle, ArrowLeft, Check, Coffee } from "lucide-react";

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

  const { trainno, trainname, price, category, seats, type, date, startstation, endstation, occupied_seats = [] } = bookingParams;

  const [ticketCount, setTicketCount] = useState(1);
  const [passengers, setPassengers] = useState([{ name: "", gender: "Male", foodtype: "No", age: "" }]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Synchronize passenger input forms and reset selected seats if ticket count changes
  useEffect(() => {
    const diff = ticketCount - passengers.length;
    if (diff > 0) {
      const newFields = Array(diff).fill(null).map(() => ({ name: "", gender: "Male", foodtype: "No", age: "" }));
      setPassengers([...passengers, ...newFields]);
    } else if (diff < 0) {
      setPassengers(passengers.slice(0, ticketCount));
    }
    
    // Adjust selected seats if they exceed the new ticketCount
    if (selectedSeats.length > ticketCount) {
      setSelectedSeats(selectedSeats.slice(0, ticketCount));
    }
  }, [ticketCount]);

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const getSeatType = (seatNum) => {
    const rem = seatNum % 8;
    if (rem === 1 || rem === 4) return { label: "Lower", code: "L" };
    if (rem === 2 || rem === 5) return { label: "Middle", code: "M" };
    if (rem === 3 || rem === 6) return { label: "Upper", code: "U" };
    if (rem === 7) return { label: "Side Lower", code: "SL" };
    return { label: "Side Upper", code: "SU" };
  };

  const handleSeatClick = (seatNum) => {
    if (occupied_seats.includes(seatNum)) return; // Occupied

    if (selectedSeats.includes(seatNum)) {
      // Remove seat
      setSelectedSeats(selectedSeats.filter(s => s !== seatNum));
    } else {
      // Add seat
      if (selectedSeats.length < ticketCount) {
        setSelectedSeats([...selectedSeats, seatNum]);
      } else {
        // Queue replacement (first-in-first-out)
        if (ticketCount === 1) {
          setSelectedSeats([seatNum]);
        } else {
          setSelectedSeats([...selectedSeats.slice(1), seatNum]);
        }
      }
    }
  };

  const foodPrices = {
    "No": 0,
    "Veg Thali": 120,
    "Non-Veg Thali": 150,
    "Snack Box": 40,
    "Beverage": 20
  };

  const cateringPrice = passengers.reduce((sum, p) => sum + (foodPrices[p.foodtype] || 0), 0);
  const basePrice = price * ticketCount;
  const totalPrice = basePrice + cateringPrice;

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

    if (selectedSeats.length !== ticketCount) {
      setError(`Please select exactly ${ticketCount} seat(s) from the coach layout layout (currently selected: ${selectedSeats.length}).`);
      setLoading(false);
      return;
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

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({
          tickets: ticketCount,
          passengers: passengers.map(p => ({
            name: p.name,
            gender: p.gender,
            foodtype: p.foodtype,
            age: parseInt(p.age)
          })),
          seats: selectedSeats
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

  // Generate compartments
  const compartments = [];
  for (let c = 0; c < 5; c++) {
    const cabinSeats = [];
    for (let s = 1; s <= 6; s++) {
      cabinSeats.push(c * 8 + s);
    }
    const sideSeats = [];
    sideSeats.push(c * 8 + 7); // Side Lower
    sideSeats.push(c * 8 + 8); // Side Upper
    compartments.push({ index: c + 1, cabinSeats, sideSeats });
  }

  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col gap-6 py-4">
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

      {/* Main Form & Grid */}
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

        {/* Seat Layout Section */}
        <div className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Interactive Coach Seat Map</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Select exactly <span className="text-amber-500 font-bold">{ticketCount}</span> seat(s). 
              Selected: <span className="text-amber-500 font-bold">{selectedSeats.join(", ") || "None"}</span>
            </p>
          </div>

          {/* Seat Map Horizontal Scroll Container */}
          <div className="w-full overflow-x-auto pb-4 pt-2 border border-gray-900 rounded-lg bg-gray-950/40">
            <div className="min-w-[850px] px-6 py-4 flex flex-col gap-6 relative">
              
              {/* Compartments Row */}
              <div className="flex gap-8 relative">
                
                {/* Left/Right Coach Ends */}
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-amber-800/40 rounded"></div>
                <div className="absolute top-0 bottom-0 right-0 w-1 bg-amber-800/40 rounded"></div>
                
                {compartments.map((comp) => (
                  <div key={comp.index} className="flex-1 border border-gray-850 p-3 rounded-lg flex flex-col gap-4 relative bg-gray-900/20">
                    <span className="absolute -top-3 left-4 text-[10px] uppercase font-bold tracking-wider text-gray-500 bg-gray-950 px-1.5 border border-gray-850 rounded">
                      Bay {comp.index}
                    </span>

                    {/* Cabin Berths (Top side) */}
                    <div className="grid grid-cols-2 gap-3.5">
                      {/* Left stack (Seats 1,2,3) */}
                      <div className="flex flex-col gap-1.5">
                        {comp.cabinSeats.slice(0, 3).map((s) => {
                          const isOccupied = occupied_seats.includes(s);
                          const isSelected = selectedSeats.includes(s);
                          const typeInfo = getSeatType(s);
                          
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleSeatClick(s)}
                              disabled={isOccupied}
                              className={`h-10 rounded-md flex flex-col items-center justify-center text-xs font-bold transition-all relative ${
                                isOccupied 
                                  ? "bg-rose-950/40 border border-rose-800/20 text-rose-500 cursor-not-allowed" 
                                  : isSelected
                                    ? "bg-amber-500 text-gray-950 border border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                                    : "bg-gray-900 hover:bg-gray-850 border border-gray-800 text-gray-300 hover:text-white"
                              }`}
                            >
                              <span>{s}</span>
                              <span className={`text-[8px] uppercase tracking-wide ${isSelected ? "text-gray-900" : "text-gray-500"}`}>
                                {typeInfo.code}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Right stack (Seats 4,5,6) */}
                      <div className="flex flex-col gap-1.5">
                        {comp.cabinSeats.slice(3, 6).map((s) => {
                          const isOccupied = occupied_seats.includes(s);
                          const isSelected = selectedSeats.includes(s);
                          const typeInfo = getSeatType(s);
                          
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleSeatClick(s)}
                              disabled={isOccupied}
                              className={`h-10 rounded-md flex flex-col items-center justify-center text-xs font-bold transition-all relative ${
                                isOccupied 
                                  ? "bg-rose-950/40 border border-rose-800/20 text-rose-500 cursor-not-allowed" 
                                  : isSelected
                                    ? "bg-amber-500 text-gray-950 border border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                                    : "bg-gray-900 hover:bg-gray-850 border border-gray-800 text-gray-300 hover:text-white"
                              }`}
                            >
                              <span>{s}</span>
                              <span className={`text-[8px] uppercase tracking-wide ${isSelected ? "text-gray-900" : "text-gray-500"}`}>
                                {typeInfo.code}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Aisle Spacer */}
                    <div className="h-6 flex items-center justify-center border-y border-dashed border-gray-850 my-1">
                      <span className="text-[8px] uppercase font-bold tracking-widest text-gray-600">Aisle</span>
                    </div>

                    {/* Side Berths (Bottom side) */}
                    <div className="grid grid-cols-2 gap-3.5">
                      {comp.sideSeats.map((s) => {
                        const isOccupied = occupied_seats.includes(s);
                        const isSelected = selectedSeats.includes(s);
                        const typeInfo = getSeatType(s);

                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleSeatClick(s)}
                            disabled={isOccupied}
                            className={`h-10 rounded-md flex flex-col items-center justify-center text-xs font-bold transition-all relative ${
                              isOccupied 
                                ? "bg-rose-950/40 border border-rose-800/20 text-rose-500 cursor-not-allowed" 
                                : isSelected
                                  ? "bg-amber-500 text-gray-950 border border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                                  : "bg-gray-900 hover:bg-gray-850 border border-gray-800 text-gray-300 hover:text-white"
                            }`}
                          >
                            <span>{s}</span>
                            <span className={`text-[8px] uppercase tracking-wide ${isSelected ? "text-gray-900" : "text-gray-500"}`}>
                              {typeInfo.code}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Seat Map Legend */}
          <div className="flex flex-wrap gap-6 text-xs text-gray-400 mt-2 border-t border-gray-850 pt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-900 border border-gray-850 rounded"></div>
              <span>Available Seat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 border border-amber-400 rounded"></div>
              <span>Selected Seat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-rose-950/40 border border-rose-800/20 rounded"></div>
              <span>Occupied Seat (Unavailable)</span>
            </div>
            <div className="text-[10px] text-gray-500 flex items-center gap-1.5 ml-auto">
              <span>L: Lower</span> • <span>M: Middle</span> • <span>U: Upper</span> • <span>SL: Side Lower</span> • <span>SU: Side Upper</span>
            </div>
          </div>
        </div>

        {/* Dynamic Passenger list */}
        <div className="flex flex-col gap-4">
          {passengers.map((p, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col gap-4 relative bg-gray-950/20">
              <div className="absolute top-4 right-4 text-xs font-black text-gray-700"># {idx + 1}</div>
              <h4 className="text-sm font-bold text-amber-500 flex items-center gap-1.5">
                <User size={16} /> Passenger {idx + 1} 
                {selectedSeats[idx] && (
                  <span className="text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 font-bold ml-2">
                    Assigned Seat: {selectedSeats[idx]} ({getSeatType(selectedSeats[idx]).label})
                  </span>
                )}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 border-t border-gray-850 pt-4 items-center">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-300 font-semibold flex items-center gap-1">
                    <Coffee size={14} className="text-amber-500" /> Dining / Food Preference
                  </label>
                  <span className="text-[10px] text-gray-500">Add catering options to your booking</span>
                </div>
                <div>
                  <select
                    value={p.foodtype}
                    onChange={(e) => handlePassengerChange(idx, "foodtype", e.target.value)}
                    className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs w-full"
                  >
                    <option value="No">No Food (₹0)</option>
                    <option value="Veg Thali">Veg Thali (₹120)</option>
                    <option value="Non-Veg Thali">Non-Veg Thali (₹150)</option>
                    <option value="Snack Box">Snack Box (₹40)</option>
                    <option value="Beverage">Beverage (₹20)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Total aggregation card */}
        <div className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-950/40">
          <div>
            <h4 className="text-md font-bold text-white">Estimated Tickets & Catering Cost</h4>
            <p className="text-xs text-gray-500 mt-1">Catering surcharges are calculated in real-time</p>
          </div>
          <div className="text-right w-full sm:w-auto">
            <div className="text-xs text-gray-500">
              Base tickets ({ticketCount}): <span className="text-white font-semibold">INR {basePrice}</span>
              {cateringPrice > 0 && (
                <span> + Catering: <span className="text-white font-semibold">INR {cateringPrice}</span></span>
              )}
            </div>
            <h3 className="text-2xl font-black text-amber-500 mt-1">
              INR {totalPrice}
            </h3>
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
