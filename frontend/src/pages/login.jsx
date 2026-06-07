import React, { useState } from "react";

const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setMessage(`Success! Logging you in...`);
        // Smoothly redirect them back to the dashboard home page after success
        setTimeout(() => setCurrentPage("home"), 1200); 
      } else {
        setMessage(data.message || "Invalid email or password.");
      }
    } catch (err) {
      setMessage("Cannot connect to backend API server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Project Authentication</h2>
        <p style={styles.subtitle}>Secure Portal Access</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>

        {message && (
          <div style={{
            ...styles.alert,
            backgroundColor: message.startsWith("Success") ? "#e6f4ea" : '#fce8e6',
            color: message.startsWith("Success") ? "#137333" : '#c5221f'
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", paddingTop: "60px", fontFamily: "system-ui, sans-serif" },
  card: { backgroundColor: "#ffffff", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", width: "100%", maxWidth: "380px" },
  title: { margin: "0 0 6px 0", textAlign: "center", color: "#111827" },
  subtitle: { margin: "0 0 28px 0", textAlign: "center", color: "#6b7280", fontSize: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#4b5563" },
  input: { padding: "11px 14px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none" },
  button: { padding: "12px", backgroundColor: "#111827", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "15px", fontWeight: "600", cursor: "pointer", marginTop: "10px" },
  alert: { marginTop: "22px", padding: "12px", borderRadius: "6px", textAlign: "center", fontSize: "13px", fontWeight: "500" }
};

export default Login;