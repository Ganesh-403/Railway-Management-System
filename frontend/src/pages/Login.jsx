import React, { useState } from "react";
import { API_BASE } from "../config";
import { LogIn, KeyRound, AlertTriangle, ArrowRight, UserPlus } from "lucide-react";

export default function Login({ setView, setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      if (data.status === "success") {
        localStorage.setItem("rail_user", JSON.stringify(data.user));
        setUser(data.user);
        setView("search");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto glass-panel p-8 rounded-xl border border-gray-800 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col items-center gap-3 text-center mb-8">
        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
          <LogIn size={26} />
        </div>
        <h2 className="text-2xl font-black text-white">Log in to RailExp</h2>
        <p className="text-sm text-gray-400">Enter your credentials to book and manage tickets</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-lg flex items-center gap-2 text-sm">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">User ID / Username</label>
          <div className="relative">
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. ram_user" 
              className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none transition-all text-sm"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Password</label>
          <div className="relative">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none transition-all text-sm"
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full text-white font-semibold py-2.5 rounded-lg gradient-bg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Log In"} <ArrowRight size={16} />
        </button>
      </form>

      <div className="border-t border-gray-850 mt-8 pt-6 flex justify-between text-xs text-gray-500">
        <button onClick={() => setView("register")} className="hover:text-amber-500 flex items-center gap-1">
          <UserPlus size={14} /> Register Account
        </button>
        <button onClick={() => setView("adminlogin")} className="hover:text-amber-500 flex items-center gap-1">
          <KeyRound size={14} /> Admin Gateway
        </button>
      </div>
    </div>
  );
}
