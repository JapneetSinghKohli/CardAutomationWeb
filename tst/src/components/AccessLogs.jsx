import React, { useState, useEffect } from "react";
import { IconSearch, } from "@tabler/icons-react";

import { useNavigate } from "react-router-dom";


import { motion, AnimatePresence } from "framer-motion";

function StatusBadge({ status }) {
  const colors = {
    Returned: "bg-green-100 text-green-700",
    Taken: "bg-blue-100 text-blue-700",
    Requested: "bg-yellow-100 text-yellow-700 cursor-pointer",
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

export default function AccessLogs() {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null); // 🔹 for modal

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return <p className="p-6">Loading...</p>;

  const filteredLogs = data.logs.filter(
    (log) =>
      log.user.toLowerCase().includes(query.toLowerCase()) ||
      log.status.toLowerCase().includes(query.toLowerCase()) ||
      log.location.toLowerCase().includes(query.toLowerCase())
  );

  const logsToShow = showAll ? filteredLogs : filteredLogs.slice(0, 5);

  return (
    <div className="p-6 relative">
      {/* Summary */}
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

      {/* Filters */}
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

      {/* Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {logsToShow.map((log) => (
            <div
              key={log.id}
              className={`p-4 rounded-lg border shadow-sm bg-white flex flex-col justify-between h-40 ${
                log.status === "Requested" ? "cursor-pointer hover:bg-gray-50" : ""
              }`}
              onClick={() => {
                if (log.status === "Requested") {
                  setSelectedLog(log);
                }
              }}
            >
              <div>
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  {log.user}
                  <StatusBadge status={log.status} />
                  <span className="text-gray-500 font-normal">{log.location}</span>
                </p>
                <p className="text-sm text-gray-500">
                  {log.method} • {new Date(log.timestamp).toLocaleString()}
                </p>
                {log.details && (
                  <p className="text-xs text-gray-400 mt-1">{log.details}</p>
                )}
              </div>
              <div className="text-xs text-gray-400 text-right">{log.ago}</div>
            </div>
          ))}
      </div>

      {/* View More */}
      {filteredLogs.length > 5 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 font-medium hover:underline"
          >
            {showAll ? "View Less" : "View More"}
          </button>
        </div>
      )}

      {/* 🔹 Modal Popup for Requested */}
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
              <p className="font-semibold">{selectedLog.user}</p>
              <p className="text-gray-600">{selectedLog.location}</p>
              <p className="text-sm text-gray-500 mt-2">
                {selectedLog.method} •{" "}
                {new Date(selectedLog.timestamp).toLocaleString()}
              </p>
              {selectedLog.details && (
                <p className="text-gray-500 mt-2">{selectedLog.details}</p>
              )}

              {/* Actions */}
              <div className="mt-6 flex gap-4">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  onClick={() => alert("Approved")}
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  onClick={() => alert("Denied")}
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

