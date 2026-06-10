import React, { useState, useEffect } from "react";
import { API_BASE } from "../config";
import { Search as SearchIcon, Calendar, Filter, Train, AlertTriangle, ArrowRightLeft, DollarSign } from "lucide-react";

export default function Search({ setView, navigateToBooking, user }) {
  const [stations, setStations] = useState([]);
  const [startStation, setStartStation] = useState("");
  const [endStation, setEndStation] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("General");
  
  const [trains, setTrains] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch stations on mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stations`);
        if (res.ok) {
          const data = await res.json();
          setStations(data);
        }
      } catch (err) {
        console.error("Failed to load stations", err);
      }
    };
    fetchStations();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setTrains([]);
    setSearched(false);

    if (!startStation || startStation === "Enter start station" || !endStation || endStation === "Enter end station" || !date) {
      setError("Please fill in start station, end station, and date.");
      return;
    }

    if (startStation === endStation) {
      setError("Start station and Destination cannot be the same.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Startstation: startStation,
          Endstation: endStation,
          Date: date,
          category
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Search query failed");
      }
      setTrains(data);
      setSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const swapStations = () => {
    const temp = startStation;
    setStartStation(endStation);
    setEndStation(temp);
  };

  const handleBook = (train, travelClass) => {
    const classData = train[travelClass];
    navigateToBooking({
      trainno: train.trainno,
      trainname: train.trainname,
      price: classData.price,
      category: travelClass,
      seats: classData.seats,
      type: category,
      date: train.date,
      startstation: startStation.split("-")[0],
      endstation: endStation.split("-")[0]
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full py-4">
      {/* Search Bar Form */}
      <div className="glass-panel p-6 rounded-xl border border-gray-800 shadow-xl relative">
        <h2 className="text-xl font-bold text-white font-black mb-6 flex items-center gap-2">
          <SearchIcon size={20} className="text-amber-500" /> Search Available Trains
        </h2>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {/* Start Station */}
          <div className="flex flex-col gap-1.5 md:col-span-1.2">
            <label className="text-xs text-gray-400">From (Source)</label>
            <select
              value={startStation}
              onChange={(e) => setStartStation(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
              required
            >
              <option value="">Select source station</option>
              {stations.map((s) => (
                <option key={s.Stationcode} value={`${s.Stationcode}-${s.Stationname}`}>
                  {s.Stationcode} - {s.Stationname}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center pb-1">
            <button 
              type="button" 
              onClick={swapStations}
              className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="Swap Stations"
            >
              <ArrowRightLeft size={16} />
            </button>
          </div>

          {/* End Station */}
          <div className="flex flex-col gap-1.5 md:col-span-1.2">
            <label className="text-xs text-gray-400">To (Destination)</label>
            <select
              value={endStation}
              onChange={(e) => setEndStation(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
              required
            >
              <option value="">Select destination station</option>
              {stations.map((s) => (
                <option key={s.Stationcode} value={`${s.Stationcode}-${s.Stationname}`}>
                  {s.Stationcode} - {s.Stationname}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar size={12} /> Date of Journey
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
              required
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 flex items-center gap-1">
              <Filter size={12} /> Ticket Quota
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
            >
              <option value="General">General</option>
              <option value="Tatkal">Tatkal</option>
            </select>
          </div>
        </form>

        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="text-sm font-semibold text-white gradient-bg hover:opacity-90 px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search Trains"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-lg flex items-center gap-2 text-sm max-w-md mx-auto w-full">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Results Dashboard */}
      {searched && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <h3 className="text-lg font-bold text-white">Matching Services ({trains.length})</h3>
            <span className="text-xs text-amber-500 bg-amber-950/40 border border-amber-800/40 px-3 py-1 rounded-full">{category} Quota</span>
          </div>

          {trains.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-xl border border-gray-800">
              <Train size={36} className="text-gray-600 mx-auto mb-3" />
              <h4 className="text-md font-semibold text-white">No services found</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">There are no trains running between these stations on the selected date.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {trains.map((train) => (
                <div key={train.trainno} className="glass-panel p-6 rounded-xl border border-gray-800 shadow-xl flex flex-col gap-6">
                  {/* Train Header Info */}
                  <div className="flex justify-between items-center border-b border-gray-800/60 pb-3 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gray-800 text-amber-500 rounded-lg">
                        <Train size={20} />
                      </div>
                      <div>
                        <h4 className="text-md font-bold text-white">{train.trainname} ({train.trainno})</h4>
                        <p className="text-xs text-gray-500">Service Date: {train.date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Travel Class Choices Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    {["SL", "3A", "2A", "1A", "CC"].map((cl) => {
                      const classData = train[cl];
                      if (!classData || classData.price === 0) return null;

                      const isAvailable = classData.seats > 0;

                      return (
                        <div key={cl} className="bg-gray-950/60 border border-gray-850 p-4 rounded-lg flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-amber-500">{cl}</span>
                            <span className="text-xs font-bold text-gray-400 flex items-center">
                              INR {classData.price}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1 border-t border-gray-900 pt-2.5">
                            <div className="flex justify-between text-[11px] text-gray-500">
                              <span>Seats:</span>
                              <span className={`font-semibold ${isAvailable ? "text-emerald-500" : "text-rose-500"}`}>
                                {isAvailable ? `${classData.seats} Avail` : "0 (WL)"}
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px] text-gray-500">
                              <span>Waitlist:</span>
                              <span className="font-semibold">{classData.wl}</span>
                            </div>
                          </div>

                          {isAvailable ? (
                            <button
                              onClick={() => handleBook(train, cl)}
                              className="w-full text-center py-1.5 text-xs text-white gradient-bg hover:opacity-90 rounded-md font-bold transition-opacity"
                            >
                              Book Class
                            </button>
                          ) : (
                            <button
                              disabled
                              className="w-full text-center py-1.5 text-xs text-gray-500 bg-gray-900 border border-gray-800 rounded-md font-semibold cursor-not-allowed"
                            >
                              Unavailable
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
