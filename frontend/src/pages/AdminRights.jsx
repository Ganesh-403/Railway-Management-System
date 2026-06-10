import React, { useState, useEffect } from "react";
import { API_BASE } from "../config";
import { 
  ShieldCheck, LogOut, CheckCircle, AlertTriangle, Calendar, 
  RefreshCw, BarChart2, Plus, Edit2, Trash2, MapPin, 
  Settings, Layers, Compass, Loader2
} from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from "recharts";

const COLORS = ["#f59e0b", "#a21caf", "#4f46e5", "#10b981", "#ef4444", "#3b82f6"];

export default function AdminRights({ setView, admin, handleAdminLogout }) {
  const [activeTab, setActiveTab] = useState("analytics");
  
  // Release state
  const [releaseTrain, setReleaseTrain] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [releaseQuota, setReleaseQuota] = useState("General");
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releaseError, setReleaseError] = useState("");
  const [releaseSuccess, setReleaseSuccess] = useState("");

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");

  // Train CRUD state
  const [trainsList, setTrainsList] = useState([]);
  const [trainsLoading, setTrainsLoading] = useState(false);
  const [trainsError, setTrainsError] = useState("");
  const [trainsSuccess, setTrainsSuccess] = useState("");

  // Train Form State
  const [isEditingTrain, setIsEditingTrain] = useState(false);
  const [trainForm, setTrainForm] = useState({
    Trainno: "",
    Trainname: "",
    Traincategory: "Express",
    Startstation: "",
    Starttime: "08:00:00",
    Endstation: "",
    Endtime: "20:00:00",
    Totalhalts: 0,
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: true,
    Sunday: true
  });

  // Route Form State
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [routeTrainNo, setRouteTrainNo] = useState("");
  const [routeForm, setRouteForm] = useState({
    RouteID: "",
    Deptstation: "",
    Depttime: "08:00:00",
    Deptday: 1,
    Arrivalstation: "",
    Arrivaltime: "12:00:00",
    Arrivalday: 1,
    Stopnumber: 1
  });

  // Load analytics and trains
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/analytics`, {
        headers: { "Authorization": `Bearer ${admin.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to load analytics");
      setAnalyticsData(data);
    } catch (e) {
      setAnalyticsError(e.message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchTrains = async () => {
    setTrainsLoading(true);
    setTrainsError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/trains`, {
        headers: { "Authorization": `Bearer ${admin.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to load trains");
      setTrainsList(data);
    } catch (e) {
      setTrainsError(e.message);
    } finally {
      setTrainsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalytics();
    } else if (activeTab === "crud") {
      fetchTrains();
    }
  }, [activeTab]);

  const handleRelease = async (e) => {
    e.preventDefault();
    setReleaseError("");
    setReleaseSuccess("");

    if (!releaseTrain || !releaseDate) {
      setReleaseError("Please select both a train number and target release date.");
      return;
    }

    setReleaseLoading(true);
    try {
      const url = new URL(`${API_BASE}/api/admin/release`);
      url.searchParams.append("trainno", releaseTrain);
      url.searchParams.append("date_str", releaseDate);
      url.searchParams.append("type", releaseQuota);

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Authorization": `Bearer ${admin.token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Release operation failed");
      }

      setReleaseSuccess(data.message || `Successfully released ${releaseQuota} seats!`);
    } catch (err) {
      setReleaseError(err.message);
    } finally {
      setReleaseLoading(false);
    }
  };

  // CRUD: Train Add/Update
  const handleTrainFormSubmit = async (e) => {
    e.preventDefault();
    setTrainsError("");
    setTrainsSuccess("");
    setTrainsLoading(true);

    try {
      const url = isEditingTrain 
        ? `${API_BASE}/api/admin/trains/${trainForm.Trainno}`
        : `${API_BASE}/api/admin/trains`;
      
      const method = isEditingTrain ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${admin.token}`
        },
        body: JSON.stringify({
          ...trainForm,
          Trainno: parseInt(trainForm.Trainno),
          Totalhalts: parseInt(trainForm.Totalhalts)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to save train details");

      setTrainsSuccess(isEditingTrain ? "Train updated successfully" : "Train created successfully");
      setIsEditingTrain(false);
      resetTrainForm();
      fetchTrains();
    } catch (err) {
      setTrainsError(err.message);
    } finally {
      setTrainsLoading(false);
    }
  };

  const handleEditClick = (train) => {
    setIsEditingTrain(true);
    setTrainForm({
      Trainno: train.Trainno.toString(),
      Trainname: train.Trainname,
      Traincategory: train.Traincategory,
      Startstation: train.Startstation,
      Starttime: train.Starttime || "08:00:00",
      Endstation: train.Endstation,
      Endtime: train.Endtime || "20:00:00",
      Totalhalts: train.Totalhalts,
      Monday: !!train.Monday,
      Tuesday: !!train.Tuesday,
      Wednesday: !!train.Wednesday,
      Thursday: !!train.Thursday,
      Friday: !!train.Friday,
      Saturday: !!train.Saturday,
      Sunday: !!train.Sunday
    });
  };

  const handleDeleteTrain = async (trainno) => {
    if (!window.confirm(`Are you sure you want to delete Train ${trainno}?`)) return;
    setTrainsError("");
    setTrainsSuccess("");
    setTrainsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/trains/${trainno}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${admin.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to delete train");

      setTrainsSuccess("Train deleted successfully");
      fetchTrains();
    } catch (err) {
      setTrainsError(err.message);
    } finally {
      setTrainsLoading(false);
    }
  };

  // Route Add Stop
  const handleRouteFormSubmit = async (e) => {
    e.preventDefault();
    setTrainsError("");
    setTrainsSuccess("");
    setTrainsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/routes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${admin.token}`
        },
        body: JSON.stringify({
          ...routeForm,
          RouteID: parseInt(routeForm.RouteID),
          Trainno: parseInt(routeTrainNo),
          Deptday: parseInt(routeForm.Deptday),
          Arrivalday: parseInt(routeForm.Arrivalday),
          Stopnumber: parseInt(routeForm.Stopnumber)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to add route stop");

      setTrainsSuccess(`Route stop added to train ${routeTrainNo} successfully`);
      setShowRouteForm(false);
      resetRouteForm();
    } catch (err) {
      setTrainsError(err.message);
    } finally {
      setTrainsLoading(false);
    }
  };

  const resetTrainForm = () => {
    setTrainForm({
      Trainno: "",
      Trainname: "",
      Traincategory: "Express",
      Startstation: "",
      Starttime: "08:00:00",
      Endstation: "",
      Endtime: "20:00:00",
      Totalhalts: 0,
      Monday: true,
      Tuesday: true,
      Wednesday: true,
      Thursday: true,
      Friday: true,
      Saturday: true,
      Sunday: true
    });
  };

  const resetRouteForm = () => {
    setRouteForm({
      RouteID: "",
      Deptstation: "",
      Depttime: "08:00:00",
      Deptday: 1,
      Arrivalstation: "",
      Arrivaltime: "12:00:00",
      Arrivalday: 1,
      Stopnumber: 1
    });
  };

  return (
    <div className="max-w-6xl w-full mx-auto flex flex-col gap-6 py-2">
      
      {/* Admin Header */}
      <div className="glass-panel p-6 rounded-xl border border-gray-800 flex justify-between items-center bg-rose-950/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-lg">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-black">Admin Control Center</h2>
            <p className="text-xs text-rose-400/80">Authorized Access • {admin.username}</p>
          </div>
        </div>
        <button
          onClick={handleAdminLogout}
          className="text-xs font-semibold border border-rose-900/40 text-rose-400 bg-rose-950/20 hover:bg-rose-900/30 px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <LogOut size={14} /> Exit Admin
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 gap-2">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === "analytics"
              ? "border-rose-500 text-rose-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <BarChart2 size={16} /> Analytics Dashboard
        </button>
        <button
          onClick={() => setActiveTab("crud")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === "crud"
              ? "border-rose-500 text-rose-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Settings size={16} /> Train & Route Manager
        </button>
        <button
          onClick={() => setActiveTab("release")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === "release"
              ? "border-rose-500 text-rose-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Calendar size={16} /> Release Inventory
        </button>
      </div>

      {/* Active Tab View */}
      <div className="flex-1">
        
        {/* TAB 1: ANALYTICS OVERVIEW */}
        {activeTab === "analytics" && (
          <div className="flex flex-col gap-6">
            {analyticsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                <Loader2 size={36} className="animate-spin text-rose-400" />
                <span className="text-sm">Fetching revenue analytics and rosters...</span>
              </div>
            ) : analyticsError ? (
              <div className="p-4 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-lg flex items-center gap-2 text-sm">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{analyticsError}</span>
              </div>
            ) : analyticsData ? (
              <>
                {/* Revenue line chart */}
                <div className="glass-panel p-6 rounded-xl border border-gray-800 shadow-xl flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Daily Booking Revenue (INR)</h3>
                  <div className="h-64 w-full">
                    {analyticsData.revenue?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.revenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                          <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                          <YAxis stroke="#9ca3af" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151" }} labelStyle={{ color: "#ffffff" }} />
                          <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-gray-500">No revenue data logged yet.</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Train Bookings Bar Chart */}
                  <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col gap-4 md:col-span-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bookings count by Train</h3>
                    <div className="h-60 w-full">
                      {analyticsData.trains?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.trains} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis dataKey="train" stroke="#9ca3af" fontSize={11} />
                            <YAxis stroke="#9ca3af" fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151" }} />
                            <Bar dataKey="bookings" fill="#a21caf" radius={[4, 4, 0, 0]}>
                              {analyticsData.trains.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-gray-500">No active bookings.</div>
                      )}
                    </div>
                  </div>

                  {/* Quotas & Dining Distribution */}
                  <div className="flex flex-col gap-6">
                    {/* Quota Pie Chart */}
                    <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col gap-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quota Split</h3>
                      <div className="h-40 w-full relative">
                        {analyticsData.quotas?.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData.quotas}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {analyticsData.quotas.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151" }} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs text-gray-500">No data</div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-[10px] text-gray-400">
                          {analyticsData.quotas?.map((q, idx) => (
                            <span key={q.name} className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                              {q.name}: {q.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Dining Pie Chart */}
                    <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col gap-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Catering Preferences</h3>
                      <div className="h-40 w-full relative">
                        {analyticsData.dining?.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData.dining}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {analyticsData.dining.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151" }} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs text-gray-500">No dining preferences</div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 flex-wrap text-[9px] text-gray-400">
                          {analyticsData.dining?.map((d, idx) => (
                            <span key={d.name} className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[(idx + 2) % COLORS.length] }}></span>
                              {d.name || "No Option"}: {d.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 glass-panel rounded-xl border border-gray-800 text-xs text-gray-500">
                No analytics summaries found.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRAIN & ROUTE CRUD */}
        {activeTab === "crud" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Trains list */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="glass-panel p-5 rounded-xl border border-gray-800 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Services List ({trainsList.length})</h3>
                  <button
                    onClick={() => {
                      setIsEditingTrain(false);
                      resetTrainForm();
                    }}
                    className="text-xs font-semibold gradient-bg px-3 py-1.5 rounded-lg flex items-center gap-1 text-white hover:opacity-90 transition-opacity"
                  >
                    <Plus size={14} /> New Train
                  </button>
                </div>

                {trainsError && (
                  <div className="p-3 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-lg text-xs flex items-center gap-1.5 mb-4">
                    <AlertTriangle size={14} /> <span>{trainsError}</span>
                  </div>
                )}

                {trainsSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 rounded-lg text-xs flex items-center gap-1.5 mb-4">
                    <CheckCircle size={14} /> <span>{trainsSuccess}</span>
                  </div>
                )}

                {trainsLoading && trainsList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 flex justify-center items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-rose-500" />
                    <span>Loading train schedules...</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                    {trainsList.map((train) => (
                      <div key={train.Trainno} className="bg-gray-950/50 border border-gray-850 p-4 rounded-lg flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-white">{train.Trainname} ({train.Trainno})</h4>
                          <span className="text-[10px] text-amber-500 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 font-bold">
                            {train.Traincategory}
                          </span>
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <Compass size={12} className="text-rose-500" /> {train.Startstation} ({train.Starttime}) &rarr; {train.Endstation} ({train.Endtime})
                          </p>
                          <div className="flex gap-1 mt-2">
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                              <span 
                                key={day} 
                                className={`text-[8px] px-1.5 py-0.5 rounded ${
                                  train[day] ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40" : "bg-gray-900 text-gray-600 border border-gray-850"
                                }`}
                              >
                                {day.substring(0, 3)}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-center">
                          <button
                            onClick={() => {
                              setRouteTrainNo(train.Trainno.toString());
                              setShowRouteForm(true);
                              setRouteForm({
                                ...routeForm,
                                RouteID: (train.Trainno * 10 + 1).toString(),
                                Stopnumber: 1
                              });
                            }}
                            className="p-1.5 bg-gray-900 hover:bg-gray-850 border border-gray-800 text-rose-400 rounded-md transition-colors"
                            title="Add Route Stop"
                          >
                            <Layers size={14} />
                          </button>
                          <button
                            onClick={() => handleEditClick(train)}
                            className="p-1.5 bg-gray-900 hover:bg-gray-850 border border-gray-800 text-amber-500 rounded-md transition-colors"
                            title="Edit Train"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTrain(train.Trainno)}
                            className="p-1.5 bg-gray-900 hover:bg-gray-850 border border-gray-800 text-rose-500 hover:bg-rose-950/40 rounded-md transition-colors"
                            title="Delete Train"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: CRUD Forms Panels */}
            <div className="flex flex-col gap-6">
              
              {/* Form A: Train Add/Update */}
              <div className="glass-panel p-5 rounded-xl border border-gray-800 shadow-xl flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {isEditingTrain ? "Modify Train Details" : "Create New Train Schedule"}
                </h3>

                <form onSubmit={handleTrainFormSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase">Train Number</label>
                      <input
                        type="number"
                        value={trainForm.Trainno}
                        onChange={(e) => setTrainForm({ ...trainForm, Trainno: e.target.value })}
                        disabled={isEditingTrain}
                        placeholder="12009"
                        className="bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 text-xs disabled:opacity-50"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase">Train Name</label>
                      <input
                        type="text"
                        value={trainForm.Trainname}
                        onChange={(e) => setTrainForm({ ...trainForm, Trainname: e.target.value })}
                        placeholder="Shatabdi Exp"
                        className="bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase">Category</label>
                      <select
                        value={trainForm.Traincategory}
                        onChange={(e) => setTrainForm({ ...trainForm, Traincategory: e.target.value })}
                        className="bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                      >
                        <option value="Shatabdi">Shatabdi</option>
                        <option value="Rajdhani">Rajdhani</option>
                        <option value="Gatimaan">Gatimaan</option>
                        <option value="Duronto">Duronto</option>
                        <option value="Express">Express</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase">Total Halts</label>
                      <input
                        type="number"
                        value={trainForm.Totalhalts}
                        onChange={(e) => setTrainForm({ ...trainForm, Totalhalts: e.target.value })}
                        className="bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase">Source Station</label>
                      <input
                        type="text"
                        value={trainForm.Startstation}
                        onChange={(e) => setTrainForm({ ...trainForm, Startstation: e.target.value })}
                        placeholder="BCT"
                        maxLength={5}
                        className="bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase">Departure Time</label>
                      <input
                        type="text"
                        value={trainForm.Starttime}
                        onChange={(e) => setTrainForm({ ...trainForm, Starttime: e.target.value })}
                        placeholder="08:20:00"
                        className="bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase">Destination</label>
                      <input
                        type="text"
                        value={trainForm.Endstation}
                        onChange={(e) => setTrainForm({ ...trainForm, Endstation: e.target.value })}
                        placeholder="ADI"
                        maxLength={5}
                        className="bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase">Arrival Time</label>
                      <input
                        type="text"
                        value={trainForm.Endtime}
                        onChange={(e) => setTrainForm({ ...trainForm, Endtime: e.target.value })}
                        placeholder="14:40:00"
                        className="bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                        required
                      />
                    </div>
                  </div>

                  {/* Active Days */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase">Operating Days</label>
                    <div className="grid grid-cols-4 gap-2 border border-gray-850 p-2.5 rounded bg-gray-950/40">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                        <label key={day} className="flex items-center gap-1 cursor-pointer text-[9px] text-gray-300">
                          <input
                            type="checkbox"
                            checked={trainForm[day]}
                            onChange={(e) => setTrainForm({ ...trainForm, [day]: e.target.checked })}
                            className="accent-rose-500"
                          />
                          {day.substring(0, 3)}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-2">
                    {isEditingTrain && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingTrain(false);
                          resetTrainForm();
                        }}
                        className="text-xs px-4 py-2 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="text-xs font-bold px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors"
                    >
                      {isEditingTrain ? "Save Details" : "Create Train"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Form B: Add Route Stop */}
              {showRouteForm && (
                <div className="glass-panel p-5 rounded-xl border border-gray-800 shadow-xl flex flex-col gap-4 bg-rose-950/5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
                    <span>Add Stop for Train {routeTrainNo}</span>
                    <button 
                      onClick={() => setShowRouteForm(false)}
                      className="text-gray-500 hover:text-gray-300 text-xs font-bold"
                    >
                      &times;
                    </button>
                  </h3>

                  <form onSubmit={handleRouteFormSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase">Route ID</label>
                        <input
                          type="number"
                          value={routeForm.RouteID}
                          onChange={(e) => setRouteForm({ ...routeForm, RouteID: e.target.value })}
                          placeholder="120091"
                          className="bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase">Stop Number</label>
                        <input
                          type="number"
                          value={routeForm.Stopnumber}
                          onChange={(e) => setRouteForm({ ...routeForm, Stopnumber: e.target.value })}
                          placeholder="1"
                          className="bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase">Dept Station</label>
                        <input
                          type="text"
                          value={routeForm.Deptstation}
                          onChange={(e) => setRouteForm({ ...routeForm, Deptstation: e.target.value })}
                          placeholder="BCT"
                          maxLength={5}
                          className="bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase">Dept Day (Index)</label>
                        <input
                          type="number"
                          value={routeForm.Deptday}
                          onChange={(e) => setRouteForm({ ...routeForm, Deptday: e.target.value })}
                          placeholder="1"
                          className="bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase">Arrival Station</label>
                        <input
                          type="text"
                          value={routeForm.Arrivalstation}
                          onChange={(e) => setRouteForm({ ...routeForm, Arrivalstation: e.target.value })}
                          placeholder="ADI"
                          maxLength={5}
                          className="bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase">Arrival Day (Index)</label>
                        <input
                          type="number"
                          value={routeForm.Arrivalday}
                          onChange={(e) => setRouteForm({ ...routeForm, Arrivalday: e.target.value })}
                          placeholder="1"
                          className="bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase">Departure Time</label>
                        <input
                          type="text"
                          value={routeForm.Depttime}
                          onChange={(e) => setRouteForm({ ...routeForm, Depttime: e.target.value })}
                          placeholder="08:20:00"
                          className="bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase">Arrival Time</label>
                        <input
                          type="text"
                          value={routeForm.Arrivaltime}
                          onChange={(e) => setRouteForm({ ...routeForm, Arrivaltime: e.target.value })}
                          placeholder="14:40:00"
                          className="bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full text-xs font-bold py-2 bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors"
                    >
                      Save Route Stop
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RELEASE SEATS INVENTORY */}
        {activeTab === "release" && (
          <div className="glass-panel p-6 rounded-xl border border-gray-800 shadow-xl flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Release Ticket Inventory</h3>
              <p className="text-xs text-gray-500 mt-1">Copy seat availability matrix from default template configuration and release for target travel dates.</p>
            </div>

            {releaseError && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-lg flex items-center gap-2 text-sm">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{releaseError}</span>
              </div>
            )}

            {releaseSuccess && (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 rounded-lg flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="shrink-0 text-emerald-500" />
                <span>{releaseSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRelease} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Train */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Select Train Service</label>
                  <input
                    type="number"
                    value={releaseTrain}
                    onChange={(e) => setReleaseTrain(e.target.value)}
                    placeholder="e.g. 12009"
                    className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500 text-sm"
                    required
                  />
                </div>

                {/* Quota Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Seat Quota Category</label>
                  <select
                    value={releaseQuota}
                    onChange={(e) => setReleaseQuota(e.target.value)}
                    className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500 text-sm"
                  >
                    <option value="General">General Quota</option>
                    <option value="Tatkal">Tatkal Quota</option>
                  </select>
                </div>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                  <Calendar size={12} /> Target Release Date
                </label>
                <input
                  type="date"
                  value={releaseDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500 text-sm w-full sm:w-1/2"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={releaseLoading}
                className="w-full sm:w-fit text-white font-semibold px-8 py-3 rounded-lg bg-rose-600 hover:bg-rose-500 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <RefreshCw size={16} className={releaseLoading ? "animate-spin" : ""} />
                {releaseLoading ? "Releasing..." : "Release Seats Inventory"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
