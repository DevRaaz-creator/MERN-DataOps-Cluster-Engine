import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx"; 

const AgentsDashboard = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  
  const [filePreviewData, setFilePreviewData] = useState([]);
  const [calculatedDistribution, setCalculatedDistribution] = useState([]);

  // 1. FETCH ALL AGENTS LIVE FROM DATABASE
  const fetchAgents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/get-agents-tasks");
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (err) {
      console.error("Error retrieving cluster:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // 2. PARSE FILE LOCAL PREVIEW AND MAP TO AGENTS IMMEDIATELY
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploadStatus("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawRows = XLSX.utils.sheet_to_json(ws);

        if (rawRows.length === 0 || agents.length === 0) return;

        const parsedRows = rawRows.map(row => ({
          firstName: row.FirstName || row.firstName || row.name || "N/A",
          phone: row.Phone || row.phone || "N/A",
          notes: row.Notes || row.notes || "No additional logs"
        }));

        setFilePreviewData(parsedRows);

        const totalItems = parsedRows.length;
        const totalAgents = agents.length;
        const baseItemsPerAgent = Math.floor(totalItems / totalAgents);
        const remainder = totalItems % totalAgents;

        let currentItemIndex = 0;
        const distributionMatrix = [];

        for (let i = 0; i < totalAgents; i++) {
          const allocationCount = baseItemsPerAgent + (i < remainder ? 1 : 0);
          const agentChunk = parsedRows.slice(currentItemIndex, currentItemIndex + allocationCount);
          currentItemIndex += allocationCount;

          distributionMatrix.push({
            agentName: agents[i].name,
            agentEmail: agents[i].email,
            allocatedLeads: agentChunk
          });
        }

        setCalculatedDistribution(distributionMatrix);
      } catch (err) {
        console.error("Local file processing compilation crash:", err);
        setUploadStatus("Error processing file layout for live preview.");
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  // 3. HANDLES TASK CONFIGURATION MATRIX UPLOAD
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadStatus("Please select a valid layout file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadStatus("Executing sequential split distribution loop...");
      const response = await fetch("http://localhost:5000/api/users/upload-tasks", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setUploadStatus(data.message);
        setFilePreviewData([]); 
        setCalculatedDistribution([]);
        setFile(null);
        fetchAgents(); 
      } else {
        setUploadStatus(data.message || "Distribution sequence failed.");
      }
    } catch (err) {
      console.error(err);
      setUploadStatus("Pipeline network mapping execution error.");
    }
  };

  // 4. EXPORT INDIVIDUAL AGENT'S TASKS BACK TO EXCEL
  const handleExportAgentTasks = (agent) => {
    if (!agent.assignedTasks || agent.assignedTasks.length === 0) {
      alert("This agent has no active tasks to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(agent.assignedTasks.map(task => ({
      "First Name": task.firstName,
      "Phone Number": task.phone,
      "Allocation Notes": task.notes
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assigned Leads Bundle");
    XLSX.writeFile(workbook, `${agent.name.replace(/\s+/g, '_')}_allocated_leads.xlsx`);
  };

  // 5. MANUAL FORCE WIPE ALL CURRENT ASSIGNMENTS (UPDATED FIX INTEGRATED)
  const handleClearAllTasks = async () => {
    if (!window.confirm("CRITICAL ACTION: Are you sure you want to completely wipe out all assigned work bundles across all agents?")) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/clear-all-tasks", {
        method: "POST"
      });

      if (response.ok) {
        alert("All clusters successfully reset to 0 loads!");
        
        // Fixed: Force wipe local file selection states so re-upload maps correctly
        setFile(null);
        setUploadStatus("");
        
        setFilePreviewData([]);
        setCalculatedDistribution([]);
        fetchAgents(); 
      } else {
        alert("Failed to clear assignment indexes.");
      }
    } catch (err) {
      console.error(err);
      alert("Server communication error.");
    }
  };

  // 6. DELETE AGENT PROFILE TRIGGER
  const handleDeleteAgent = async (agentId) => {
    if (!window.confirm("Are you sure you want to drop this agent from cluster assignment?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/users/delete-agent/${agentId}`, {
        method: "DELETE"
      });
      if (response.ok) fetchAgents();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate high-water mark metrics for our premium visual metrics container
  const totalSystemLeads = agents.reduce((acc, a) => acc + (a.assignedTasks ? a.assignedTasks.length : 0), 0);

  if (loading) {
    return <div className="p-10 text-center font-medium text-gray-500">Loading Control Room Nodes...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans">
      
      {/* HEADER SECTION */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Control Room</h1>
        <p className="text-sm text-gray-500 mt-1">MERN Stack Task Distribution Engine</p>
      </div>

      {/* METRIC BANNER & LOAD BALANCE MATRIX GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* STATS RENDER BANNER */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 font-bold text-lg">👥</div>
            <div>
              <p className="text-xl font-black text-gray-900">{agents.length}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Operational Agents</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 font-bold text-lg">📈</div>
            <div>
              <p className="text-xl font-black text-gray-900">{totalSystemLeads} Rows</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Distributed Workload</p>
            </div>
          </div>
        </div>

        {/* OUTSTANDING LEVEL: CUSTOM HTML CORE ANALYTICS GRAPH LOAD MATRIX */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">📊 Real-Time Cluster Cluster Load Metrics Balance</h3>
            {agents.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Load mapping engine awaiting active agents registry...</p>
            ) : (
              <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                {agents.map(a => {
                  const agentLeadsCount = a.assignedTasks ? a.assignedTasks.length : 0;
                  const percentage = totalSystemLeads > 0 ? (agentLeadsCount / totalSystemLeads) * 100 : 0;
                  return (
                    <div key={a._id} className="flex items-center text-xs">
                      <span className="w-24 truncate font-semibold text-gray-700 capitalize">{a.name}</span>
                      <div className="flex-1 bg-gray-100 h-3 rounded-full overflow-hidden mx-3 border border-gray-50">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-500 shadow-xs" 
                          style={{ width: `${totalSystemLeads > 0 ? percentage : 5}%`, backgroundColor: agentLeadsCount > 0 ? '#2563eb' : '#d1d5db' }}
                        ></div>
                      </div>
                      <span className="font-bold text-gray-900 w-12 text-right">{agentLeadsCount} Loads</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* CORE CONTROL HUB GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FILE INTERACTION WORKSTATION */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-4">
          <h2 className="text-md font-bold text-gray-800 mb-2 flex items-center">📊 Upload & Splitting Matrix</h2>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer bg-gray-50/50 transition-colors">
              <input 
                type="file" 
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                // Dynamic reset binding: forces the native file input DOM name value 
                // to empty out whenever 'file' state becomes null
                value={file ? undefined : ''}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 file:cursor-pointer"
              />
              <p className="text-[11px] text-gray-400 mt-2">Supports .csv, .xlsx, or .xls spreadsheets</p>
            </div>
            
            <button 
              type="submit"
              disabled={!file}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              Execute Even Split Distribution
            </button>
          </form>

          <button 
            type="button"
            onClick={handleClearAllTasks}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold py-2 rounded-xl text-xs transition-colors shadow-2xs mt-2"
          >
            ⚠️ Wipe All Current Assignments
          </button>

          {uploadStatus && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-[11px] font-semibold border border-emerald-100 text-center">
              {uploadStatus}
            </div>
          )}
        </div>

        {/* CORE ACTIVE AGENT CLUSTER DISPLAY */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-md font-bold text-gray-800 mb-4 flex items-center">👥 Live Cluster Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent) => (
                <div key={agent._id} className="relative bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[160px]">
                  <button
                    onClick={() => handleDeleteAgent(agent._id)}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 font-bold text-xs p-1.5 transition-colors border border-transparent hover:border-gray-100 rounded-lg bg-gray-50/50"
                  >
                    ✕
                  </button>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm capitalize">{agent.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{agent.email}</p>
                    <p className="text-[11px] text-gray-500 mt-2">
                      <span className="text-gray-400 mr-1">📞</span> Phone: {agent.mobile}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between">
                    
                    {/* OUTSTANDING LEVEL: EXTRACTION DEEP LINK ACTION */}
                    <button
                      onClick={() => handleExportAgentTasks(agent)}
                      disabled={!agent.assignedTasks || agent.assignedTasks.length === 0}
                      className="text-[10px] bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 text-gray-600 font-bold px-2.5 py-1 rounded-lg border border-gray-200 shadow-3xs flex items-center space-x-1"
                      title="Download Split File Segment"
                    >
                      📥 <span>Export Sheet</span>
                    </button>

                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                      {agent.assignedTasks ? agent.assignedTasks.length : 0} Loads
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MATRIX PREVIEW GRID */}
      {calculatedDistribution.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
          <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-md font-bold text-gray-900">🔍 Live Distribution File Preview</h2>
              <p className="text-xs text-gray-400 mt-0.5">Below is exactly how the rows inside "{file?.name}" will divide across your active agents:</p>
            </div>
            <span className="bg-blue-50 text-blue-600 text-xs font-extrabold px-3 py-1 rounded-lg border border-blue-100">
              {filePreviewData.length} Total Incoming File Leads
            </span>
          </div>

          <div className="space-y-6">
            {calculatedDistribution.map((group, index) => (
              <div key={index} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <h3 className="text-xs font-black text-gray-800 capitalize">{group.agentName} <span className="text-gray-400 font-normal">({group.agentEmail})</span></h3>
                  </div>
                  <span className="text-[10px] bg-white border border-gray-200 text-gray-600 font-bold px-2 py-0.5 rounded-md shadow-2xs">
                    Will receive: {group.allocatedLeads.length} rows
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs bg-white rounded-lg border border-gray-100 overflow-hidden">
                    <thead className="bg-gray-100 text-gray-600 font-semibold text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2">First Name</th>
                        <th className="px-4 py-2">Phone</th>
                        <th className="px-4 py-2">Notes Summary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {group.allocatedLeads.map((lead, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-2 font-medium text-gray-900">{lead.firstName}</td>
                          <td className="px-4 py-2 text-gray-500">{lead.phone}</td>
                          <td className="px-4 py-2 text-gray-400 italic max-w-xs truncate">{lead.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default AgentsDashboard;