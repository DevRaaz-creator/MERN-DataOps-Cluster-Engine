import React, { useState, useEffect } from "react";
import Navbar from "./components/Nuvbar.jsx";
import Home from "./pages/home.jsx";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Agents from "./pages/agents.jsx";
import NotFound from "./components/NotFound.jsx";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  // Automatically sync application state with browser address bar pathing on load
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === "/" || currentPath === "/home") {
      setCurrentPage("home");
    } else if (currentPath === "/login") {
      setCurrentPage("login");
    } else if (currentPath === "/register") {
      setCurrentPage("register");
    } else if (currentPath === "/agents") {
      setCurrentPage("agents");
    } else {
      setCurrentPage("notfound");
    }
  }, []);

  // Conditional Core Router Switch
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        // Passing currentPage as a key forces React to completely re-fetch database info every time you click back here!
        return <Home key={currentPage} />;
      case "login":
        return <Login setCurrentPage={setCurrentPage} />;
      case "register":
        return <Register setCurrentPage={setCurrentPage} />;
      case "agents":
        return <Agents />;
      case "notfound":
      default:
        return <NotFound setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div style={styles.appWrapper}>
      {currentPage !== "notfound" && (
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      )}
      
      <main style={styles.mainContent}>
        {renderPage()}
      </main>
    </div>
  );
}

const styles = {
  appWrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f3f4f6",
    margin: 0,
    padding: 0,
  },
  mainContent: {
    flex: 1,
    width: "100%",
  }
};

export default App;