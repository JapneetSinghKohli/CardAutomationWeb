import React, { useState, useEffect } from "react";
import {
  IconKey,
  IconTrash,
  IconEdit,
  IconSearch,
} from "@tabler/icons-react";

function StatusBadge({ status }) {
  const classes = {
    available: "bg-green-100 text-green-700",
    in_use: "bg-yellow-100 text-yellow-700",
    maintenance: "bg-red-100 text-red-700",
  };

  const labels = {
    available: "Available",
    in_use: "In Use",
    maintenance: "Maintenance",
  };

  return (
    <span
      className={`px-3 py-1 text-sm font-medium rounded-full ${
        classes[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

function KeyCard({ keyItem }) {
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-md hover:shadow-lg transition">
      {/* Status badge top-right */}
      <div className="absolute top-3 right-3">
        <StatusBadge status={keyItem.status} />
      </div>

      {/* Icon + Title */}
      <div className="flex items-center gap-3 mb-3">
        <IconKey className="w-6 h-6 text-gray-600" />
        <div>
          <h3 className="text-lg font-semibold">{keyItem.name}</h3>
          <p className="text-sm text-gray-500">Slot {keyItem.slot}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-2">{keyItem.description}</p>

      {/* Maintenance info */}
      <p className="text-xs text-gray-400 mb-3">
        Last maintenance: {keyItem.lastMaintenance}
      </p>

      {/* Extra info if in use */}
      {keyItem.status === "in_use" && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-gray-800">
          <p>
            Currently with: <b>{keyItem.currentUser}</b>
          </p>
          <p>Taken at: {keyItem.takenAt}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-4">
        {keyItem.status === "in_use" && (
          <button className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100 transition">
            Force Return
          </button>
        )}
        <button className="p-2 rounded-lg hover:bg-gray-100 transition">
          <IconEdit className="h-5 w-5 text-gray-600" />
        </button>
        <button className="p-2 rounded-lg hover:bg-red-50 transition">
          <IconTrash className="h-5 w-5 text-red-500" />
        </button>
      </div>
    </div>
  );
}

export default function KeyManagement() {
  const [data, setData] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) {
    return <p className="p-4">Loading...</p>;
  }

  // 🔍 filter keys by search
  const filteredKeys = data.keys.filter((keyItem) =>
    keyItem.name.toLowerCase().includes(query.toLowerCase())
  );

  // limit to 4 if not showing all
  const visibleKeys = showAll ? filteredKeys : filteredKeys.slice(0, 4);

  return (
    <div className="p-6">
      {/* Header with search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2 md:mb-0">Key Management</h1>
          <p className="text-gray-600">
            Manage all club keys, their status, and physical locations
          </p>
        </div>

        <div className="relative mt-3 md:mt-0 w-full md:w-64">
          <input
            type="text"
            placeholder="Search keys..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <IconSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-lg bg-white p-4 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Total Keys</h3>
          <p className="mt-2 text-2xl font-bold">{data.summary.total}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Available</h3>
          <p className="mt-2 text-2xl font-bold">{data.summary.available}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">In Use</h3>
          <p className="mt-2 text-2xl font-bold">{data.summary.in_use}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Maintenance</h3>
          <p className="mt-2 text-2xl font-bold">{data.summary.maintenance}</p>
        </div>
      </div>

      {/* Keys List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch auto-rows-fr">
        {visibleKeys.map((keyItem, idx) => (
          <KeyCard key={idx} keyItem={keyItem} />
        ))}
      </div>

      {/* View More Button */}
      {filteredKeys.length > 4 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            {showAll ? "View Less" : "View More"}
          </button>
        </div>
      )}
    </div>
  );
}
