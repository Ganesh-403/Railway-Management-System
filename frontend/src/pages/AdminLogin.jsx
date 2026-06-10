import React, { useState } from "react";
import { API_BASE } from "../config";
import { ShieldAlert, AlertTriangle, ArrowRight, User } from "lucide-react";

export default function AdminLogin({ setView, setAdmin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Admin authentication failed");
      }

      if (data.status === "success") {
        localStorage.setItem("rail_admin", data.username);
        setAdmin(data.username);
        setView("adminrights");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto glass-panel p-8 rounded-xl border border-gray-800 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[50px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col items-center gap-3 text-center mb-8">
        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
          <ShieldAlert size={26} />
        </div>
        <h2 className="text-2xl font-black text-white">Admin Control Center</h2>
        <p className="text-sm text-gray-400">Authorized administrative personnel only</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-lg flex items-center gap-2 text-sm">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Admin User ID</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. Ram" 
            className="w-full bg-gray-900 border border-gray-800 focus:border-rose-500 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none transition-all text-sm"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
            className="w-full bg-gray-900 border border-gray-800 focus:border-rose-500 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none transition-all text-sm"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full text-white font-semibold py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Access Control"} <ArrowRight size={16} />
        </button>
      </form>

      <div className="border-t border-gray-850 mt-8 pt-6 text-center text-xs text-gray-500">
        <button onClick={() => setView("login")} className="hover:text-amber-500 flex items-center gap-1 mx-auto">
          <User size={14} /> Back to User Login
        </button>
      </div>
    </div>
  );
}
