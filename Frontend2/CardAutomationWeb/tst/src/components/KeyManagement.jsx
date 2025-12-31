import React, { useState, useEffect } from "react";
import {
  IconKey,
  IconTrash,
  IconEdit,
  IconSearch,
  IconCircleCheck,
  IconAlertCircle,
  IconTool,
  IconUser,
  IconClock,
} from "@tabler/icons-react";

// Enhanced Status Badge Component
function StatusBadge({ status }) {
  const config = {
    available: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
      icon: IconCircleCheck,
      label: "Available"
    },
    in_use: {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-700 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-800",
      icon: IconUser,
      label: "In Use"
    },
    maintenance: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
      icon: IconTool,
      label: "Maintenance"
    }
  };

  const statusConfig = config[status] || {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700",
    icon: IconAlertCircle,
    label: status
  };

  const Icon = statusConfig.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
      <Icon className="h-4 w-4" />
      {statusConfig.label}
    </span>
  );
}

function KeyCard({ keyItem, user, onAction }) {
  const userRole = user?.role?.toLowerCase() || "member";
  const userClubId = user?.club_id;
  const keyClubId = keyItem.club_id;

  const isAdmin = userRole === "admin";
  const isCoordinator = userRole === "coordinator";
  const isMyClubKey = keyClubId === userClubId;

  const canEdit = isAdmin || (isCoordinator && isMyClubKey);
  const canForceReturn = isAdmin || (isCoordinator && isMyClubKey);
  const canDelete = isAdmin;

  const handleEdit = () => {
    let action = "";
    let confirmMsg = "";

    if (keyItem.status === "maintenance") {
      action = "available";
      confirmMsg = "Set key to Available?";
    } else {
      action = "maintenance";
      confirmMsg = "Set key to Maintenance?";
    }

    if (window.confirm(confirmMsg)) {
      onAction(keyItem.key_id, action);
    }
  };

  return (
    <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 transition-all flex flex-col justify-between h-full">
      <div>
        {/* Header with Icon and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <IconKey className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{keyItem.club_name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{keyItem.key_name || keyItem.name || `Key ${keyItem.key_id}`}</p>
            </div>
          </div>
          <StatusBadge status={keyItem.status} />
        </div>

        {/* Description */}
        {keyItem.description && (
          <p className="text-sm text-gray-600 mb-3 pl-15">{keyItem.description}</p>
        )}

        {/* Currently With Section (Enhanced) */}
        {keyItem.status === "in_use" && (
          <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border border-orange-200 dark:border-orange-900/50 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {(keyItem.current_user_name || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {keyItem.current_user_name || "Unknown User"}
                </p>
                {keyItem.taken_at && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <IconClock className="h-3 w-3" />
                    Taken: {new Date(keyItem.taken_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4 mt-4 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
        {keyItem.status === "in_use" && canForceReturn && (
          <button
            onClick={() => {
              if (window.confirm("Force return this key? This will close all active logs for this key."))
                onAction(keyItem.key_id, "force_return");
            }}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-all"
          >
            Force Return
          </button>
        )}

        {canEdit && keyItem.status !== "in_use" && (
          <button
            onClick={handleEdit}
            className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${keyItem.status === 'maintenance'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 hover:border-green-400 dark:hover:border-green-700'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 hover:border-red-400 dark:hover:border-red-700'
              }`}
          >
            {keyItem.status === 'maintenance' ? "Set Available" : "Set Maintenance"}
          </button>
        )}

        {canDelete && (
          <button
            onClick={() => alert("Delete functionality requires Admin API (Not Implemented)")}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Delete Key"
          >
            <IconTrash className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, gradient }) {
  return (
    <div className={`rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-br ${gradient} p-6 shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="mt-3 text-4xl font-bold text-white">{value}</p>
        </div>
        <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function KeyManagement({ user }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  // Pagination State
  const [visibleCount, setVisibleCount] = useState(6);
  const handleViewMore = () => setVisibleCount(prev => prev + 6);
  const handleViewLess = () => setVisibleCount(6);

  const fetchKeys = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8001/api/keys/")
      .then((res) => res.json())
      .then((json) => {
        if (json.keys) {
          setKeys(json.keys);
        } else {
          setKeys([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load keys");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleAction = async (keyId, action) => {
    try {
      const res = await fetch(`http://127.0.0.1:8001/api/keys/${keyId}/action/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action,
          requester_id: user.id,
          club_id: user.club_id
        })
      });
      const result = await res.json();
      if (result.success) {
        alert("Success!");
        fetchKeys();
      } else {
        alert("Error: " + (result.error || "Unknown error"));
      }
    } catch (e) {
      alert("Network error: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) return <p className="p-6 text-red-500">{error}</p>;

  const filteredKeys = keys.filter((k) =>
    (k.key_name || "").toLowerCase().includes(query.toLowerCase()) ||
    (k.club_name || "").toLowerCase().includes(query.toLowerCase())
  );

  const total = keys.length;
  const available = keys.filter(k => k.status === 'available').length;
  const in_use = keys.filter(k => k.status === 'in_use').length;
  const maintenance = keys.filter(k => k.status === 'maintenance').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Key Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor all keys • Role: <span className="font-semibold capitalize text-gray-900 dark:text-white">{user?.role || "Guest"}</span>
          </p>
        </div>

        <div className="relative mt-4 md:mt-0 w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name or club..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          <IconSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Keys"
          value={total}
          icon={IconKey}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Available"
          value={available}
          icon={IconCircleCheck}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="In Use"
          value={in_use}
          icon={IconUser}
          gradient="from-orange-500 to-yellow-500"
        />
        <StatCard
          title="Maintenance"
          value={maintenance}
          icon={IconTool}
          gradient="from-red-500 to-red-600"
        />
      </div>

      {/* Keys Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredKeys.slice(0, visibleCount).map((keyItem) => (
          <KeyCard
            key={keyItem.key_id}
            keyItem={keyItem}
            user={user}
            onAction={handleAction}
          />
        ))}
      </div>

      {/* View More / View Less Buttons */}
      <div className="flex justify-center gap-4 mt-8 mb-4">
        {filteredKeys.length > visibleCount && (
          <button
            onClick={handleViewMore}
            className="px-6 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition-all flex items-center gap-2"
          >
            View More <span className="text-blue-200 text-xs">({filteredKeys.length - visibleCount} remaining)</span>
          </button>
        )}

        {visibleCount > 6 && (
          <button
            onClick={handleViewLess}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-300 dark:hover:bg-gray-700 hover:shadow-md transition-all flex items-center gap-2"
          >
            View Less
          </button>
        )}
      </div>

      {filteredKeys.length === 0 && (
        <div className="text-center py-12">
          <IconKey className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No keys found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search query</p>
        </div>
      )}
    </div>
  );
}