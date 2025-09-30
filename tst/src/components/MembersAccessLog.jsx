import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// StatusBadge component
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
        colors[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function TokenReveal({ token }) {
  const [show, setShow] = React.useState(false);

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



export default function MembersAccessLogs() {
  const [data, setData] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Request form states
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");

  // hardcoded current member
  const currentUser = "john_doe";

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return <p className="p-6">Loading...</p>;

  // Separate logs for this member
  const accessHistory = data.logs.filter(
    (log) => log.user === currentUser && log.status !== "Requested"
  );
  const requestStatus = data.logs.filter(
    (log) => log.user === currentUser && log.status === "Requested"
  );

  

  // Function to handle request submission (adds to state for testing)
  const handleSubmitRequest = () => {
    if (!startTime || !endTime) {
      alert("Please specify both start and end times.");
      return;
    }

    const newLog = {
      id: data.logs.length + 1,
      user: currentUser,
      status: "Requested",
      location: "Robotronics Club", // or dynamic club if needed
      method: "Pending",
      timestamp: new Date().toISOString(),
      details: reason,
      startTime,
      endTime,
      ago: "0d ago",
    };

    setData({
      ...data,
      logs: [newLog, ...data.logs],
    });

    // Reset form
    setStartTime("");
    setEndTime("");
    setReason("");
    setShowRequestForm(false);
  };

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold mb-6">Logs</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-lg bg-white p-4 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Total Activities</h3>
          <p className="mt-2 text-2xl font-bold">{data.summary.total}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Today</h3>
          <p className="mt-2 text-2xl font-bold">{data.summary.today}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Keys Taken</h3>
          <p className="mt-2 text-2xl font-bold text-red-600">{data.summary.taken}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Keys Returned</h3>
          <p className="mt-2 text-2xl font-bold text-green-600">{data.summary.returned}</p>
        </div>
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6">My Access</h1>

      {/* Side by side tables */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Access History Table */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border divide-y">
          <h2 className="p-4 font-semibold text-gray-800 border-b">Access History</h2>
          {accessHistory.length === 0 ? (
            <p className="p-4 text-gray-500">No history found</p>
          ) : (
            accessHistory.map((log) => (
              <div key={log.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{log.location}</p>
                  <p className="text-sm text-gray-500">
                    {log.method} • {new Date(log.timestamp).toLocaleString()}
                  </p>
                  {log.startTime && log.endTime && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(log.startTime).toLocaleTimeString()} - {new Date(log.endTime).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                  {log.status === "Approved" && log.code && log.user === currentUser && log.method === "Token" && (
                    <div className="mt-2">
                      <TokenReveal token={log.code} />
                    </div>
                  )}


                <span className="ml-4">
                  <StatusBadge status={log.status} />
                </span>
              </div>
            ))
          )}
        </div>

        {/* Request Status Table */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border divide-y">
          <h2 className="p-4 font-semibold text-gray-800 border-b">Request Status</h2>
          {requestStatus.length === 0 ? (
            <p className="p-4 text-gray-500">No requests found</p>
          ) : (
            requestStatus.map((log) => (
              <div key={log.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{log.location}</p>
                  <p className="text-sm text-gray-500">
                    {log.method} • {new Date(log.timestamp).toLocaleString()}
                  </p>
                  {log.startTime && log.endTime && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(log.startTime).toLocaleTimeString()} - {new Date(log.endTime).toLocaleTimeString()}
                    </p>
                  )}
                  {log.details && <p className="text-xs text-gray-400 mt-1">{log.details}</p>}
                </div>
                <span className="ml-4">
                  <StatusBadge status={log.status} />
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Request button */}
      <div className="mt-6 text-center">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          onClick={() => setShowRequestForm(true)}
        >
          File Access Request
        </button>
      </div>

      {/* Request Form Modal */}
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

              {/* Start and End Time */}
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

              {/* Reason */}
              <label className="block mb-2 text-sm font-medium">Reason</label>
              <textarea
                className="w-full border rounded-lg p-2 mb-4"
                rows="3"
                placeholder="Enter reason for access..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              ></textarea>

              {/* Actions */}
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
