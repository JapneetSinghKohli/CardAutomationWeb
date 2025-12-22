import React, { useState, useEffect } from "react";
import { IconSearch } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Access({ user }) {
  if (!user) {
    return (
      <div className="p-6 text-center text-red-500">
        <h2>You must be logged in to view this page.</h2>
      </div>
    );
  }

  function StatusBadge({ status }) {
    const colors = {
      Returned: "bg-green-100 text-green-700",
      Taken: "bg-blue-100 text-blue-700",
      Requested: "bg-yellow-100 text-yellow-700",
      Approved: "bg-teal-100 text-teal-700",
      Denied: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          colors[status] ?? "bg-gray-100 text-gray-600"
        }`}
      >
        {status}
      </span>
    );
  }

  // Helper to convert datetime-local string to ISO string (backend expects ISO format)
  const toISOStringFixed = (datetimeLocalStr) => new Date(datetimeLocalStr).toISOString();

  // Coordinator View Component
  function CoordinatorView() {
    const [data, setData] = useState({ logs: [] });
    const [query, setQuery] = useState("");
    const [showAll, setShowAll] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
      fetch("http://127.0.0.1:8001/api/logs/")
        .then((res) => res.json())
        .then((json) => {
          // Handle the updated data structure with logs and summary
          setData(json); // Backend now returns {logs: [...], summary: {...}}
        })
        .catch(console.error);
    }, []);

    if (!data || !data.logs) return <p className="p-6">Loading...</p>;

    const clubLogs = data.logs.filter((log) => log.key_id?.toString() === "1");

    const filteredLogs = clubLogs.filter(
      (log) =>
        log.user_id?.toLowerCase().includes(query.toLowerCase()) ||
        log.status?.toLowerCase().includes(query.toLowerCase()) ||
        log.key_id?.toString().includes(query)
    );

    const logsToShow = showAll ? filteredLogs : filteredLogs.slice(0, 5);

    const handleDecision = async (logId, action) => {
      try {
        const res = await fetch(`http://127.0.0.1:8001/api/request/${logId}/approve/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          alert("Failed to update status: " + (errorData.error || res.statusText));
          return;
        }
        const result = await res.json();
        if (result.success) {
          setData((prev) => ({
            ...prev,
            logs: (prev.logs || []).map((l) => 
              l.activity_id === logId ? {...l, status: action, code: "ROBO1234"} : l
            ),
          }));
          setSelectedLog(null);
        } else {
          alert("Failed to update status");
        }
      } catch (error) {
        console.error("Decision error:", error);
        alert("Failed to update status");
      }
    };

    return (
      <div className="p-6 relative">
        <h1 className="text-2xl font-bold mb-6">Logs</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard title="Total Activities" value={data.summary?.total ?? 0} />
          <SummaryCard title="Today" value={data.summary?.today ?? 0} />
          <SummaryCard title="Keys Taken" value={data.summary?.taken ?? 0} extraClass="text-red-600" />
          <SummaryCard title="Keys Returned" value={data.summary?.returned ?? 0} extraClass="text-green-600" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search logs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <IconSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {logsToShow.map((log) => (
            <div
              key={log.activity_id}
              className={`p-4 rounded-lg border shadow-sm bg-white flex flex-col justify-between h-40 ${
                log.status === "Requested" ? "cursor-pointer hover:bg-gray-50" : ""
              }`}
              onClick={() => log.status === "Requested" && setSelectedLog(log)}
            >
              <div>
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-sm text-gray-400">ID: {log.user_id}</span>
                  <StatusBadge status={log.status} />
                  <span className="text-gray-500 font-normal">Key: {log.key_id}</span>
                </p>
                <p className="text-sm text-gray-500">
                  {log.action || "N/A"} • {new Date(log.activity_time).toLocaleString()}
                </p>
                {log.reason && <p className="text-xs text-gray-400 mt-1">{log.reason}</p>}
              </div>
            </div>
          ))}
        </div>
        {filteredLogs.length > 5 && (
          <div className="text-center mt-4">
            <button onClick={() => setShowAll(!showAll)} className="text-blue-600 font-medium hover:underline">
              {showAll ? "View Less" : "View More"}
            </button>
          </div>
        )}
        <AnimatePresence>
          {selectedLog && (
            <motion.div
              className="fixed inset-0 backdrop-blur-1xl bg-opacity-40 flex justify-center items-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <h2 className="text-xl font-bold mb-4">Access Request</h2>
                <p className="font-semibold">{selectedLog.user_id}</p>
                <p className="text-gray-600">Key: {selectedLog.key_id}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedLog.action || "N/A"} • {new Date(selectedLog.activity_time).toLocaleString()}
                </p>
                {selectedLog.reason && <p className="text-gray-500 mt-2">{selectedLog.reason}</p>}
                <div className="mt-6 flex gap-4">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    onClick={() => handleDecision(selectedLog.activity_id, "Approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    onClick={() => handleDecision(selectedLog.activity_id, "Denied")}
                  >
                    Deny
                  </button>
                  <button
                    className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                    onClick={() => setSelectedLog(null)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Member View component
  function MemberView() {
    const [data, setData] = useState({ logs: [] });
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [reason, setReason] = useState("");

    function TokenReveal({ token }) {
      const [show, setShow] = useState(false);

      return (
        <div>
          <button
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            onClick={() => setShow(!show)}
          >
            {show ? "Hide Token" : "Show Token"}
          </button>
          <AnimatePresence>
            {show && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-1 font-mono text-green-700"
              >
                {token}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Debug the user object
    console.log("User object:", user);
    
    // Make sure we have a valid user_id, fallback to a default if not available
    const currentUser = user?.id || "default_user_id";
    
    useEffect(() => {
      console.log("Current user ID being used:", currentUser);
      fetch("http://127.0.0.1:8001/api/logs/")
        .then((res) => res.json())
        .then((json) => {
          setData(json); // Backend now returns {logs: [...], summary: {...}}
        })
        .catch(console.error);
    }, []);

    if (!data || !data.logs) return <p className="p-6">Loading...</p>;

    const accessHistory = (data.logs ?? []).filter(
      (log) => log.user_id === currentUser && log.status !== "Requested"
    );

    const requestStatus = (data.logs ?? []).filter(
      (log) => log.user_id === currentUser && log.status === "Requested"
    );

    const handleSubmitRequest = async () => {
      if (!startTime || !endTime) {
        alert("Please specify both start and end times.");
        return;
      }

      const selectedKeyId = 1; // customize your logic here

      // Ensure user_id is included and valid
      const body = {
        user_id: user?.id || "default_user", // Use direct user.id instead of currentUser
        key_id: selectedKeyId,
        start_time: toISOStringFixed(startTime),
        end_time: toISOStringFixed(endTime),
        reason,
      };
      
      console.log("Sending request with body:", body);

      try {
        const res = await fetch("http://127.0.0.1:8001/api/request/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errorData = await res.json();
          alert("Failed to submit request: " + (errorData.error || res.statusText));
          return;
        }

        const result = await res.json();

        if (result.success) {
          setData((prev) => ({
            ...prev,
            logs: [result.data, ...(prev.logs || [])],
          }));
          setShowRequestForm(false);
          setStartTime("");
          setEndTime("");
          setReason("");
        } else {
          alert("Failed to submit request: " + (result.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Submit request error:", error);
        alert("Failed to submit request: Network error?");
      }
    };

    return (
      <div className="p-6 relative">
        <h1 className="text-2xl font-bold mb-6">Logs</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard title="Total Activities" value={data.summary?.total ?? 0} />
          <SummaryCard title="Today" value={data.summary?.today ?? 0} />
          <SummaryCard title="Keys Taken" value={data.summary?.taken ?? 0} extraClass="text-red-600" />
          <SummaryCard title="Keys Returned" value={data.summary?.returned ?? 0} extraClass="text-green-600" />
        </div>

        <h1 className="text-2xl font-bold mb-6">My Access</h1>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-white rounded-lg shadow-sm border divide-y">
            <h2 className="p-4 font-semibold text-gray-800 border-b">Access History</h2>
            {accessHistory.length === 0 ? (
              <p className="p-4 text-gray-500">No history found</p>
            ) : (
              accessHistory.map((log) => (
                <div key={log.activity_id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{log.key_id}</p>
                    <p className="text-sm text-gray-500">
                      {log.action || "N/A"} • {new Date(log.activity_time).toLocaleString()}
                    </p>
                    {log.start_time && log.end_time && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(log.start_time).toLocaleTimeString()} - {new Date(log.end_time).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  {/* <log className="code"></log> */}
                  {/* log.code = "ROBO1234"; */}
                  {log.status === "Approved" && log.code && log.user_id === currentUser && (
                    <TokenReveal token={log.code} />
                  )}
                  <span className="ml-4">
                    <StatusBadge status={log.status} />
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="flex-1 bg-white rounded-lg shadow-sm border divide-y">
            <h2 className="p-4 font-semibold text-gray-800 border-b">Request Status</h2>
            {requestStatus.length === 0 ? (
              <p className="p-4 text-gray-500">No requests found</p>
            ) : (
              requestStatus.map((log) => (
                <div key={log.activity_id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{log.key_id}</p>
                    <p className="text-sm text-gray-500">
                      {log.action || "N/A"} • {new Date(log.activity_time).toLocaleString()}
                    </p>
                    {log.start_time && log.end_time && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(log.start_time).toLocaleTimeString()} - {new Date(log.end_time).toLocaleTimeString()}
                      </p>
                    )}
                    {log.reason && <p className="text-xs text-gray-400 mt-1">{log.reason}</p>}
                  </div>
                  <span className="ml-4">
                    <StatusBadge status={log.status} />
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            onClick={() => setShowRequestForm(true)}
          >
            File Access Request
          </button>
        </div>

        <AnimatePresence>
          {showRequestForm && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <h2 className="text-xl font-bold mb-4">New Access Request</h2>
                <label className="block mb-2 text-sm font-medium">Start Time</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded-lg p-2 mb-4"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <label className="block mb-2 text-sm font-medium">End Time</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded-lg p-2 mb-4"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
                <label className="block mb-2 text-sm font-medium">Reason</label>
                <textarea
                  className="w-full border rounded-lg p-2 mb-4"
                  rows="3"
                  placeholder="Enter reason for access..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
                <div className="flex gap-4">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    onClick={handleSubmitRequest}
                  >
                    Submit
                  </button>
                  <button
                    className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                    onClick={() => setShowRequestForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Summary Card Component
  function SummaryCard({ title, value, extraClass }) {
    return (
      <div className={`rounded-lg bg-white shadow-sm p-4 border ${extraClass ?? ""}`}>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-black">{value}</p>
      </div>
    );
  }

  return user.role === "coordinator" ? <CoordinatorView /> : <MemberView />;
}
