import React, { useEffect, useState } from "react";

const Home = () => {
  const [adminProfile, setAdminProfile] = useState(null);
  const [agentList, setAgentList] = useState([]);
  const [targetFile, setTargetFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const refreshSystemData = async () => {
    const activeToken = localStorage.getItem("token");
    console.log("Current user authorization key token status:", activeToken);

    // 1. Fetch Agent data rows globally with structured header contexts
    try {
      const agentsResponse = await fetch("http://localhost:5000/api/users/get-agents-tasks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": activeToken ? `Bearer ${activeToken}` : ""
        }
      });
      
      if (agentsResponse.ok) {
        const structuralData = await agentsResponse.json();
        console.log("UI received records array from backend server node:", structuralData);
        setAgentList(Array.isArray(structuralData) ? structuralData : []);
      } else {
        console.log("Failed reading tracking endpoint context data arrays.");
      }
    } catch (err) {
      console.error("Agent array download pipeline broken:", err);
    }

    // 2. Fetch Active Admin identity profile cards
    if (activeToken) {
      try {
        const userResponse = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        if (userResponse.ok) {
          const profileData = await userResponse.json();
          setAdminProfile(profileData);
        }
      } catch (err) {
        console.error("Admin identity validation context fetch dropped:", err);
      }
    }
  };

  useEffect(() => {
    refreshSystemData();
  }, []);

  const processingCsvUpload = async (e) => {
    e.preventDefault();
    if (!targetFile) return;
    setUploading(true);
    setStatusMessage("");

    const payloadForm = new FormData();
    payloadForm.append("file", targetFile);

    try {
      const serverResponse = await fetch("http://localhost:5000/api/users/upload-tasks", {
        method: "POST",
        body: payloadForm,
      });
      const visualFeedback = await serverResponse.json();
      
      setStatusMessage(visualFeedback.message || "File spreadsheet data transaction verified.");
      if (serverResponse.ok) {
        refreshSystemData();
        setTargetFile(null);
      }
    } catch (err) {
      setStatusMessage("Failed connecting to parsing target endpoint.");
    } finally {
      setUploading(false);
    }
  };

  const totalLeadsCalculated = agentList.reduce((accumulator, currentAgent) => {
    return accumulator + (currentAgent.assignedTasks?.length || 0);
  }, 0);

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.headerTray}>
        <div>
          <h1 style={styles.mainTitle}>System Control Room</h1>
          <p style={styles.subtitleText}>MERN Stack Task Distribution Engine</p>
        </div>
        {adminProfile && (
          <div style={styles.adminBadge}>
            <span style={styles.onlineDot}></span>
            <strong>Admin Account:</strong> {adminProfile.email}
          </div>
        )}
      </header>

      <section style={styles.metricsRow}>
        <div style={styles.metricCard}>
          <span style={styles.metricIcon}>👥</span>
          <div>
            <h4 style={styles.metricValue}>{agentList.length}</h4>
            <p style={styles.metricLabel}>Active Registered Agents</p>
          </div>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricIcon}>📊</span>
          <div>
            <h4 style={styles.metricValue}>{totalLeadsCalculated}</h4>
            <p style={styles.metricLabel}>Total Distributed Rows</p>
          </div>
        </div>
      </section>

      <div style={styles.workspaceLayout}>
        <div style={styles.controlPanel}>
          <h3 style={styles.sectionHeading}>📥 Upload & Splitting Matrix</h3>
          <p style={styles.panelDescription}>
            Select a target lead list configuration sheet (`.csv`). The pipeline splits records sequentially.
          </p>

          <form onSubmit={processingCsvUpload} style={styles.uploadForm}>
            <div style={styles.dropzoneWrapper}>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setTargetFile(e.target.files[0])}
                required
                style={styles.nativeFileInput}
              />
              <div style={styles.customDropzoneText}>
                📁 {targetFile ? `Selected: ${targetFile.name}` : "Click to load spreadsheet layout"}
              </div>
            </div>
            <button type="submit" disabled={uploading} style={styles.processButton}>
              {uploading ? "Balancing Vectors..." : "Execute Even Split Distribution"}
            </button>
          </form>

          {statusMessage && (
            <div style={{
              ...styles.statusNotification,
              backgroundColor: statusMessage.startsWith("Success") ? "#e6f4ea" : "#fce8e6",
              color: statusMessage.startsWith("Success") ? "#137333" : "#c5221f"
            }}>
              {statusMessage}
            </div>
          )}
        </div>

        <div style={styles.displayPanel}>
          <h3 style={styles.sectionHeading}>👥 Live Cluster Assignments</h3>
          
          {agentList.length === 0 ? (
            <div style={styles.emptyContainer}>
              No active agents found. Use the "Add Agents" interface view tab to register your core team.
            </div>
          ) : (
            <div style={styles.agentsGrid}>
              {agentList.map((agentItem) => (
                <div key={agentItem._id} style={styles.agentOverviewCard}>
                  <div style={styles.cardHeaderSummary}>
                    <div>
                      <h4 style={styles.agentCardName}>{agentItem.name}</h4>
                      <p style={styles.agentCardMeta}>{agentItem.email}</p>
                    </div>
                    <span style={styles.taskCountBadge}>
                      {agentItem.assignedTasks?.length || 0} Leads
                    </span>
                  </div>
                  
                  <div style={styles.phoneNumberLabel}>📱 Phone Entry: {agentItem.mobile}</div>
                  
                  <h5 style={styles.innerTableHeading}>Assigned Work Bundles:</h5>
                  <div style={styles.nestedScrollerTray}>
                    {agentItem.assignedTasks && agentItem.assignedTasks.length > 0 ? (
                      agentItem.assignedTasks.map((taskItem, itemIndex) => (
                        <div key={itemIndex} style={styles.leadRowItem}>
                          <div style={styles.leadPrimaryRow}>
                            <strong>{taskItem.firstName}</strong>
                            <span>📞 {taskItem.phone}</span>
                          </div>
                          <p style={styles.leadNotesParagraph}>📝 {taskItem.notes || "No context specified."}</p>
                        </div>
                      ))
                    ) : (
                      <div style={styles.fallbackNoTasks}>Awaiting lead array uploads...</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboardContainer: { padding: "32px", fontFamily: "system-ui, sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" },
  headerTray: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "20px", marginBottom: "24px" },
  mainTitle: { fontSize: "26px", fontWeight: "800", color: "#111827", margin: 0 },
  subtitleText: { fontSize: "14px", color: "#4b5563", margin: "4px 0 0 0" },
  adminBadge: { backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "8px 14px", borderRadius: "20px", fontSize: "13px", color: "#1e40af", display: "flex", alignItems: "center", gap: "8px" },
  onlineDot: { width: "8px", height: "8px", backgroundColor: "#10b981", borderRadius: "50%" },
  metricsRow: { display: "flex", gap: "20px", marginBottom: "28px" },
  metricCard: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "10px", border: "1px solid #e5e7eb", flex: 1, display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },
  metricIcon: { fontSize: "28px", backgroundColor: "#f3f4f6", padding: "10px", borderRadius: "8px" },
  metricValue: { fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 },
  metricLabel: { fontSize: "12px", color: "#6b7280", margin: "2px 0 0 0" },
  workspaceLayout: { display: "grid", gridTemplateColumns: "350px 1fr", gap: "24px" },
  controlPanel: { backgroundColor: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb", height: "fit-content" },
  sectionHeading: { fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0" },
  panelDescription: { fontSize: "12px", color: "#6b7280", margin: "0 0 20px 0", lineHeight: "1.5" },
  uploadForm: { display: "flex", flexDirection: "column", gap: "16px" },
  dropzoneWrapper: { position: "relative", width: "100%", height: "100px", border: "2px dashed #d1d5db", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb", cursor: "pointer" },
  nativeFileInput: { position: "absolute", width: "100%", height: "100%", opacity: 0, cursor: "pointer" },
  customDropzoneText: { fontSize: "13px", fontWeight: "500", color: "#4b5563", padding: "0 16px", textAlign: "center" },
  processButton: { backgroundColor: "#2563eb", color: "#ffffff", padding: "12px", borderRadius: "6px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "background-color 0.2s" },
  statusNotification: { padding: "12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", textAlign: "center", marginTop: "8px" },
  displayPanel: { backgroundColor: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb" },
  emptyContainer: { border: "1px dashed #d1d5db", borderRadius: "8px", padding: "40px", textAlign: "center", color: "#6b7280", fontSize: "14px", backgroundColor: "#f9fafb" },
  agentsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px", marginTop: "16px" },
  agentOverviewCard: { border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" },
  cardHeaderSummary: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f3f4f6", paddingBottom: "10px", marginBottom: "10px" },
  agentCardName: { fontSize: "15px", fontWeight: "700", color: "#111827", margin: 0 },
  agentCardMeta: { fontSize: "11px", color: "#6b7280", margin: "2px 0 0 0" },
  taskCountBadge: { backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" },
  phoneNumberLabel: { fontSize: "12px", color: "#4b5563", marginBottom: "12px" },
  innerTableHeading: { fontSize: "12px", fontWeight: "700", color: "#374151", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.5px" },
  nestedScrollerTray: { display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto", paddingRight: "4px" },
  leadRowItem: { backgroundColor: "#f3f4f6", padding: "8px 10px", borderRadius: "6px" },
  leadPrimaryRow: { display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#111827" },
  leadNotesParagraph: { margin: "4px 0 0 0", color: "#6b7280", fontSize: "11px" },
  fallbackNoTasks: { fontSize: "11px", color: "#9ca3af", fontStyle: "italic", textAlign: "center", padding: "12px 0" }
};

export default Home;