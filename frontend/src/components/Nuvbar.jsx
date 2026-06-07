import React from "react";

const Navbar = ({ currentPage, setCurrentPage }) => {
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentPage("login");
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo} onClick={() => setCurrentPage("home")}>
        🚀 MERN Auth Portal
      </div>
      <div style={styles.navLinks}>
        <button 
          onClick={() => setCurrentPage("home")} 
          style={{ ...styles.linkBtn, fontWeight: currentPage === "home" ? "700" : "400" }}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setCurrentPage("agents")} 
          style={{ ...styles.linkBtn, fontWeight: currentPage === "agents" ? "700" : "400" }}
        >
          Add Agents
        </button>
        <button 
          onClick={() => setCurrentPage("login")} 
          style={{ ...styles.linkBtn, fontWeight: currentPage === "login" ? "700" : "400" }}
        >
          Login
        </button>
        <button 
          onClick={() => setCurrentPage("register")} 
          style={{ ...styles.linkBtn, fontWeight: currentPage === "register" ? "700" : "400" }}
        >
          Register
        </button>
        <button 
          onClick={handleLogout} 
          style={styles.logoutBtn}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111827",
    padding: "16px 40px",
    color: "#ffffff",
    fontFamily: "system-ui, sans-serif",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  logo: {
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    letterSpacing: "0.5px"
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#9ca3af",
    fontSize: "14px",
    cursor: "pointer",
    outline: "none",
    padding: "6px 10px",
    transition: "color 0.2s ease",
    ":hover": {
      color: "#ffffff"
    }
  },
  logoutBtn: {
    backgroundColor: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s ease"
  }
};

export default Navbar;