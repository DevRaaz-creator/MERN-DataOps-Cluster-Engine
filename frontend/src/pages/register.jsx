import React, { useState } from "react";

const Register = ({ setCurrentPage }) => {
  // 1. Core form state hooks
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); 
  const [password, setPassword] = useState("");
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // 2. Form Submit Engine
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    // Simple validation safety fallback
    if (!name || !email || !phone || !password) {
      setIsError(true);
      setMessage("All agent fields are required");
      setLoading(false);
      return;
    }

    try {
      // EXACT URL MATCH: Points directly to your backend add-agent endpoint
      const response = await fetch("http://localhost:5000/api/users/add-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: name, 
          email: email, 
          phone: phone, 
          password: password 
        }), 
      });

      const data = await response.json();

      if (response.ok) {
        setIsError(false);
        setMessage("Agent profile registered successfully!");
        
        // Wipe inputs for next entry loop
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");

        // Head back to monitor area after a quick look
        setTimeout(() => {
          if (setCurrentPage) setCurrentPage("agents");
        }, 1200);
      } else {
        setIsError(true);
        setMessage(data.message || "All agent fields are required");
      }
    } catch (err) {
      console.error("Connection Error:", err);
      setIsError(true);
      setMessage("Cannot connect to backend API server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 max-w-md w-full">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Agent Management</h2>
          <p className="text-xs text-gray-400 mt-1">Add a new team agent to the cluster distribution layout</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Agent Full Name Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Agent Full Name</label>
            <input
              type="text"
              placeholder="alpha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              required
            />
          </div>

          {/* Email Address Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="alpha@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              required
            />
          </div>

          {/* Mobile Number Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number (With Country Code)</label>
            <input
              type="text"
              placeholder="918765432109"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              required
            />
          </div>

          {/* Access Password Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Access Password</label>
            <input
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              required
            />
          </div>

          {/* Blue Submission Trigger */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm shadow-sm mt-2 disabled:bg-blue-400"
          >
            {loading ? "Processing Link..." : "Add Agent Profile"}
          </button>
        </form>

        {/* Status Notification Alert */}
        {message && (
          <div 
            className={`mt-4 p-3 rounded-xl text-center text-xs font-semibold border ${
              isError 
                ? "bg-red-50 border-red-200 text-red-500" 
                : "bg-emerald-50 border-emerald-200 text-emerald-600"
            }`}
          >
            {message}
          </div>
        )}

        <div className="text-center mt-4">
          <button 
            type="button"
            onClick={() => setCurrentPage && setCurrentPage("dashboard")}
            className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            Back to Control Room
          </button>
        </div>

      </div>
    </div>
  );
};

export default Register;