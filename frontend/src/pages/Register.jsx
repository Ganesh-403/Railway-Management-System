import React, { useState } from "react";
import { API_BASE } from "../config";
import { UserPlus, ChevronRight, ChevronLeft, Check, AlertTriangle } from "lucide-react";

export default function Register({ setView }) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form State
  const [step1, setStep1] = useState({ username: "", password: "", securityquestion: "What is your pet name?", securityanswer: "" });
  const [step2, setStep2] = useState({ fname: "", mname: "", lname: "", occupation: "Student", DOB: "", martialstatus: "Single", country: "India", sex: "Male", email: "", mobileno: "" });
  const [step3, setStep3] = useState({ fno: "", lane: "", area: "", state: "", pincode: "", city: "" });

  const nextStep = async () => {
    setError("");
    if (step === 1) {
      if (!step1.username || !step1.password || !step1.securityanswer) {
        setError("Please fill out all credentials.");
        return;
      }
      setLoading(true);
      try {
        // Validate duplicate username
        const res = await fetch(`${API_BASE}/api/check-username`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(step1)
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || "Username validation failed");
        }
        setStep(2);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      if (!step2.fname || !step2.lname || !step2.DOB || !step2.email || !step2.mobileno) {
        setError("Please fill out all required personal details.");
        return;
      }
      setStep(3);
    }
  };

  const prevStep = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!step3.fno || !step3.lane || !step3.area || !step3.state || !step3.pincode || !step3.city) {
      setError("Please fill out all address details.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step1, step2, step3 })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      if (data.status === "success") {
        alert("Registration successful! Please login.");
        setView("login");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto glass-panel p-8 rounded-xl border border-gray-800 shadow-2xl relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
          <UserPlus size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white font-black">Register Account</h2>
          <p className="text-xs text-gray-500">Create an account to search and book tickets</p>
        </div>
      </div>

      {/* Stepper Progress bar */}
      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border transition-all ${
                step >= s ? "gradient-bg border-transparent text-white shadow-lg shadow-amber-900/20" : "border-gray-800 text-gray-500 bg-gray-900"
              }`}>
                {step > s ? <Check size={14} /> : s}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider hidden sm:inline ${
                step === s ? "text-amber-500 font-bold" : "text-gray-500"
              }`}>
                {s === 1 ? "Credentials" : s === 2 ? "Personal" : "Address"}
              </span>
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 rounded-full transition-colors ${step > s ? "gradient-bg" : "bg-gray-850"}`}></div>}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-lg flex items-center gap-2 text-sm">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Contents */}
      <div className="min-h-[250px]">
        {step === 1 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-850 pb-2 mb-2">Step 1: Account Credentials</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Username / User ID</label>
                <input 
                  type="text" 
                  value={step1.username}
                  onChange={(e) => setStep1({...step1, username: e.target.value})}
                  placeholder="e.g. ganesh_99" 
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Password</label>
                <input 
                  type="password" 
                  value={step1.password}
                  onChange={(e) => setStep1({...step1, password: e.target.value})}
                  placeholder="••••••••" 
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Security Question</label>
                <select 
                  value={step1.securityquestion}
                  onChange={(e) => setStep1({...step1, securityquestion: e.target.value})}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                >
                  <option>What is your pet name?</option>
                  <option>What is your mother's maiden name?</option>
                  <option>What is your school name?</option>
                  <option>What is your favorite city?</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Security Answer</label>
                <input 
                  type="text" 
                  value={step1.securityanswer}
                  onChange={(e) => setStep1({...step1, securityanswer: e.target.value})}
                  placeholder="Your Answer" 
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-850 pb-2 mb-2">Step 2: Personal Profile Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">First Name</label>
                <input 
                  type="text" 
                  value={step2.fname}
                  onChange={(e) => setStep2({...step2, fname: e.target.value})}
                  placeholder="First name"
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Middle Name</label>
                <input 
                  type="text" 
                  value={step2.mname}
                  onChange={(e) => setStep2({...step2, mname: e.target.value})}
                  placeholder="Middle name"
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Last Name</label>
                <input 
                  type="text" 
                  value={step2.lname}
                  onChange={(e) => setStep2({...step2, lname: e.target.value})}
                  placeholder="Last name"
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Occupation</label>
                <input 
                  type="text" 
                  value={step2.occupation}
                  onChange={(e) => setStep2({...step2, occupation: e.target.value})}
                  placeholder="Student, Doctor, etc."
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Date of Birth</label>
                <input 
                  type="date" 
                  value={step2.DOB}
                  onChange={(e) => setStep2({...step2, DOB: e.target.value})}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Marital Status</label>
                <select 
                  value={step2.martialstatus}
                  onChange={(e) => setStep2({...step2, martialstatus: e.target.value})}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                >
                  <option>Single</option>
                  <option>Married</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Country</label>
                <input 
                  type="text" 
                  value={step2.country}
                  onChange={(e) => setStep2({...step2, country: e.target.value})}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Gender</label>
                <select 
                  value={step2.sex}
                  onChange={(e) => setStep2({...step2, sex: e.target.value})}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-gray-400">Email Address</label>
                <input 
                  type="email" 
                  value={step2.email}
                  onChange={(e) => setStep2({...step2, email: e.target.value})}
                  placeholder="e.g. name@mail.com"
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Mobile Number</label>
                <input 
                  type="number" 
                  value={step2.mobileno}
                  onChange={(e) => setStep2({...step2, mobileno: e.target.value})}
                  placeholder="Mobile number"
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-850 pb-2 mb-2">Step 3: Residential Address</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Flat / House No.</label>
                <input 
                  type="text" 
                  value={step3.fno}
                  onChange={(e) => setStep3({...step3, fno: e.target.value})}
                  placeholder="Flat No."
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Street / Lane</label>
                <input 
                  type="text" 
                  value={step3.lane}
                  onChange={(e) => setStep3({...step3, lane: e.target.value})}
                  placeholder="Street details"
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Locality / Area</label>
                <input 
                  type="text" 
                  value={step3.area}
                  onChange={(e) => setStep3({...step3, area: e.target.value})}
                  placeholder="Area"
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">City</label>
                <input 
                  type="text" 
                  value={step3.city}
                  onChange={(e) => setStep3({...step3, city: e.target.value})}
                  placeholder="City"
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">State</label>
                <input 
                  type="text" 
                  value={step3.state}
                  onChange={(e) => setStep3({...step3, state: e.target.value})}
                  placeholder="State"
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Pincode</label>
                <input 
                  type="number" 
                  value={step3.pincode}
                  onChange={(e) => setStep3({...step3, pincode: e.target.value})}
                  placeholder="Postal code"
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="border-t border-gray-850 mt-8 pt-6 flex justify-between gap-4">
        {step > 1 ? (
          <button 
            type="button" 
            onClick={prevStep}
            className="text-sm font-semibold hover:text-white text-gray-400 border border-gray-800 bg-gray-900 px-5 py-2 rounded-lg flex items-center gap-1.5 transition-all"
          >
            <ChevronLeft size={16} /> Previous
          </button>
        ) : (
          <button 
            type="button" 
            onClick={() => setView("login")}
            className="text-sm font-semibold text-gray-400 hover:text-white px-3 transition-colors"
          >
            Cancel and Return
          </button>
        )}

        {step < 3 ? (
          <button 
            type="button" 
            onClick={nextStep}
            disabled={loading}
            className="text-sm font-semibold text-white gradient-bg hover:opacity-90 px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {loading ? "Checking..." : "Continue"} <ChevronRight size={16} />
          </button>
        ) : (
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={loading}
            className="text-sm font-semibold text-white gradient-bg hover:opacity-90 px-8 py-2.5 rounded-lg shadow-lg shadow-amber-900/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {loading ? "Registering..." : "Submit Registration"} <Check size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
