import React, { useState, useEffect } from "react";
import { IconSearch, } from "@tabler/icons-react";

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

export default function AccessLogs() {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/logs.json")
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

  return (
    <div className="p-6">
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
      <div className="bg-white rounded-lg shadow-sm border divide-y">
        {filteredLogs.length === 0 ? (
          <p className="p-4 text-gray-500">No logs found</p>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-4 flex justify-between items-center">
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
              <div className="text-xs text-gray-400">{log.ago}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
