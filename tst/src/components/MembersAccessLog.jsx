import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MembersAccessLogs() {
  const [data, setData] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // hardcoded current member
  const currentUser = "john_doe";

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return <p className="p-6">Loading...</p>;

  // show only this member’s logs
  const memberLogs = data.logs.filter((log) => log.user === currentUser);

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold mb-6">My Access History</h1>

      {/* Logs */}
      <div className="bg-white rounded-lg shadow-sm border divide-y">
        {memberLogs.length === 0 ? (
          <p className="p-4 text-gray-500">No logs found</p>
        ) : (
          memberLogs.map((log) => (
            <div key={log.id} className="p-4">
              <p className="font-semibold text-gray-800">{log.location}</p>
              <p className="text-sm text-gray-500">
                {log.method} • {new Date(log.timestamp).toLocaleString()}
              </p>
            </div>
          ))
        )}
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

              {/* Time dropdown */}
              <label className="block mb-2 text-sm font-medium">
                Select Time
              </label>
              <select className="w-full border rounded-lg p-2 mb-4">
                <option>09:00 - 10:00</option>
                <option>10:00 - 11:00</option>
                <option>11:00 - 12:00</option>
                <option>14:00 - 15:00</option>
                <option>15:00 - 16:00</option>
              </select>

              {/* Reason */}
              <label className="block mb-2 text-sm font-medium">
                Reason
              </label>
              <textarea
                className="w-full border rounded-lg p-2 mb-4"
                rows="3"
                placeholder="Enter reason for access..."
              ></textarea>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  onClick={() => {
                    alert("Request submitted!");
                    setShowRequestForm(false);
                  }}
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
