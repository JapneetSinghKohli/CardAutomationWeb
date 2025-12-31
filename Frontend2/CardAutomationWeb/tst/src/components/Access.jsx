import React, { useState, useEffect } from "react";
import { IconSearch, IconActivity, IconClock, IconArrowUp, IconArrowDown, IconKey, IconShield, IconTrash, IconCalendar } from "@tabler/icons-react";
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
        className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] ?? "bg-gray-100 text-gray-600"
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
    // Pagination State
    const [visibleCount, setVisibleCount] = useState(6);
    const handleViewMore = () => setVisibleCount(prev => prev + 6);
    const handleViewLess = () => setVisibleCount(6);


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

    // Remove club filter - show ALL logs
    const filteredLogs = data.logs.filter(
      (log) =>
        log.user_name?.toLowerCase().includes(query.toLowerCase()) ||
        log.key_name?.toLowerCase().includes(query.toLowerCase()) ||
        log.club_name?.toLowerCase().includes(query.toLowerCase()) ||
        log.status?.toLowerCase().includes(query.toLowerCase()) ||
        log.reason?.toLowerCase().includes(query.toLowerCase())
    );

    const logsToShow = filteredLogs.slice(0, visibleCount);

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
              l.activity_id === logId ? { ...l, status: action, code: "ROBO1234" } : l
            ),
          }));
        } else {
          alert("Failed to update status");
        }
      } catch (error) {
        console.error("Decision error:", error);
        alert("Failed to update status");
      }
    };

    return (
      <div className="p-6 relative space-y-6 min-h-screen bg-transparent">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Logs</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Total Activities</p>
                <p className="mt-3 text-4xl font-bold text-white">{data.summary?.total ?? 0}</p>
              </div>
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <IconActivity className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Today</p>
                <p className="mt-3 text-4xl font-bold text-white">{data.summary?.today ?? 0}</p>
              </div>
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <IconClock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-red-500 to-red-600 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Keys Taken</p>
                <p className="mt-3 text-4xl font-bold text-white">{data.summary?.taken ?? 0}</p>
              </div>
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <IconArrowUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Keys Returned</p>
                <p className="mt-3 text-4xl font-bold text-white">{data.summary?.returned ?? 0}</p>
              </div>
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <IconArrowDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search by name, key, status..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            <IconSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {logsToShow.map((log) => (
            <div
              key={log.activity_id}
              className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                {/* User Name & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {(log.user_name || "U")[0].toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{log.user_name || "Unknown"}</span>
                  </div>
                  <StatusBadge status={log.status} />
                </div>

                {/* Key Name */}
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg px-3 py-2 border border-blue-100 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">{log.key_name || `Key ${log.key_id}`}</p>
                </div>

                {/* Details Grid */}
                <div className="space-y-1.5 text-xs">
                  {log.reason && (
                    <div className="flex gap-2">
                      <span className="font-semibold text-gray-600 dark:text-gray-400 min-w-[60px]">Reason:</span>
                      <span className="text-gray-800 dark:text-gray-200">{log.reason}</span>
                    </div>
                  )}

                  {log.start_time && (
                    <div className="flex gap-2">
                      <span className="font-semibold text-gray-600 dark:text-gray-400 min-w-[60px]">From:</span>
                      <span className="text-gray-800 dark:text-gray-200">{new Date(log.start_time).toLocaleString()}</span>
                    </div>
                  )}

                  {log.end_time && (
                    <div className="flex gap-2">
                      <span className="font-semibold text-gray-600 dark:text-gray-400 min-w-[60px]">To:</span>
                      <span className="text-gray-800 dark:text-gray-200">{new Date(log.end_time).toLocaleString()}</span>
                    </div>
                  )}

                  {(log.status === "Taken" || log.status === "Returned") && (
                    <div className="flex gap-2">
                      <span className="font-semibold text-gray-600 dark:text-gray-400 min-w-[60px]">{log.status === "Taken" ? "Taken:" : "Returned:"}</span>
                      <span className="text-gray-800 dark:text-gray-200">{new Date(log.activity_time).toLocaleString()}</span>
                    </div>
                  )}

                  {log.status === "Requested" && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecision(log.activity_id, "Approved");
                        }}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors shadow-sm shadow-green-100"
                      >
                        Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecision(log.activity_id, "Denied");
                        }}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors shadow-sm shadow-red-100"
                      >
                        Deny
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More / View Less Buttons */}
        <div className="flex justify-center gap-4 mt-8 mb-4">
          {filteredLogs.length > visibleCount && (
            <button
              onClick={handleViewMore}
              className="px-6 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition-all flex items-center gap-2"
            >
              View More <span className="text-blue-200 text-xs">({filteredLogs.length - visibleCount} remaining)</span>
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

    // Pagination State
    const [historyCount, setHistoryCount] = useState(5);
    const [requestsCount, setRequestsCount] = useState(5);

    function TokenReveal({ token }) {
      const [show, setShow] = useState(false);

      return (
        <div className="flex flex-col items-end">
          <button
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2 ${show
              ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              : "bg-green-600 text-white hover:bg-green-700 shadow-green-100 dark:shadow-none"
              }`}
            onClick={() => setShow(!show)}
          >
            {show ? "Hide Token" : "Show Token"}
          </button>
          <AnimatePresence>
            {show && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-4 py-2 rounded-xl"
              >
                <p className="font-mono text-xl font-bold text-green-700 dark:text-green-400 tracking-widest text-center">
                  {token}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    const currentUser = user?.id || "default_user_id";

    useEffect(() => {
      fetch("http://127.0.0.1:8001/api/logs/")
        .then((res) => res.json())
        .then((json) => {
          setData(json);
        })
        .catch(console.error);
    }, []);

    if (!data || !data.logs) return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );

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

      const body = {
        user_id: user?.id,
        key_id: 1,
        start_time: toISOStringFixed(startTime),
        end_time: toISOStringFixed(endTime),
        reason,
      };

      try {
        const res = await fetch("http://127.0.0.1:8001/api/request/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errorData = await res.json();
          alert("Failed: " + (errorData.error || res.statusText));
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
        }
      } catch (error) {
        alert("Network error?");
      }
    };

    return (
      <div className="p-6 relative space-y-8 min-h-screen bg-transparent transition-colors duration-300">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Logs</h1>
          <button
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
            onClick={() => setShowRequestForm(true)}
          >
            File Access Request
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg">
            <div className="flex items-start justify-between text-white">
              <div>
                <p className="text-sm font-medium opacity-80">Total Activities</p>
                <p className="mt-3 text-4xl font-bold">{data.summary?.total ?? 0}</p>
              </div>
              <IconActivity className="h-6 w-6 opacity-60" />
            </div>
          </div>
          {/* ... Other Stat Cards follow same pattern ... */}
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-lg">
            <div className="flex items-start justify-between text-white">
              <div>
                <p className="text-sm font-medium opacity-80">Today</p>
                <p className="mt-3 text-4xl font-bold">{data.summary?.today ?? 0}</p>
              </div>
              <IconClock className="h-6 w-6 opacity-60" />
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-red-500 to-red-600 p-6 shadow-lg">
            <div className="flex items-start justify-between text-white">
              <div>
                <p className="text-sm font-medium opacity-80">Keys Taken</p>
                <p className="mt-3 text-4xl font-bold">{data.summary?.taken ?? 0}</p>
              </div>
              <IconArrowUp className="h-6 w-6 opacity-60" />
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-lg">
            <div className="flex items-start justify-between text-white">
              <div>
                <p className="text-sm font-medium opacity-80">Keys Returned</p>
                <p className="mt-3 text-4xl font-bold">{data.summary?.returned ?? 0}</p>
              </div>
              <IconArrowDown className="h-6 w-6 opacity-60" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Access History */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-800 pb-2">Access History</h2>
            <div className="space-y-4">
              {accessHistory.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">No history found</p>
                </div>
              ) : (
                accessHistory.slice(0, historyCount).map((log) => (
                  <div key={log.activity_id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <IconKey className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-lg">{log.key_name || `Key ${log.key_id}`}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <IconShield className="h-4 w-4" /> {log.club_name || "N/A"}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={log.status} />
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 grid grid-cols-2 gap-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <p className="flex items-center gap-1"><IconCalendar className="h-3 w-3" /> Date</p>
                        <p className="font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{new Date(log.activity_time).toLocaleDateString()}</p>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <p className="flex items-center gap-1"><IconClock className="h-3 w-3" /> Time</p>
                        <p className="font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{new Date(log.activity_time).toLocaleTimeString()}</p>
                      </div>
                    </div>

                    {log.status === "Approved" && log.code && (
                      <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-end">
                        <TokenReveal token={log.code} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-center gap-3">
              {accessHistory.length > historyCount && (
                <button
                  onClick={() => setHistoryCount(prev => prev + 5)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-blue-100 shadow-lg hover:bg-blue-700"
                >
                  View More
                </button>
              )}
              {historyCount > 5 && (
                <button
                  onClick={() => setHistoryCount(5)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300"
                >
                  View Less
                </button>
              )}
            </div>
          </div>

          {/* Request Status */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-800 pb-2">Request Status</h2>
            <div className="space-y-4">
              {requestStatus.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">No active requests</p>
                </div>
              ) : (
                requestStatus.slice(0, requestsCount).map((log) => (
                  <div key={log.activity_id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                          <IconClock className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-lg">{log.key_name || `Key ${log.key_id}`}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{log.club_name || "N/A"}</p>
                        </div>
                      </div>
                      <StatusBadge status={log.status} />
                    </div>

                    {log.reason && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs italic text-gray-600 dark:text-gray-400">
                        "{log.reason}"
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">From</p>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{new Date(log.start_time).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">To</p>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{new Date(log.end_time).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-center gap-3">
              {requestStatus.length > requestsCount && (
                <button
                  onClick={() => setRequestsCount(prev => prev + 5)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold shadow-purple-100 shadow-lg hover:bg-purple-700"
                >
                  View More
                </button>
              )}
              {requestsCount > 5 && (
                <button
                  onClick={() => setRequestsCount(5)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300"
                >
                  View Less
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Request Modal */}
        <AnimatePresence>
          {showRequestForm && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg border border-gray-100"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Request Key Access
                  </h2>
                  <button onClick={() => setShowRequestForm(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all">
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <IconCalendar className="h-4 w-4 text-blue-500" /> Start Time
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 rounded-2xl p-3 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <IconClock className="h-4 w-4 text-purple-500" /> End Time
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 rounded-2xl p-3 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Reason for Access</label>
                    <textarea
                      className="w-full border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
                      rows="4"
                      placeholder="e.g., Equipment testing for project X..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-50 dark:border-gray-800">
                  <button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl shadow-blue-100 dark:shadow-none"
                    onClick={handleSubmitRequest}
                  >
                    Send Request
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

  return user?.role?.toLowerCase() === "coordinator" ? <CoordinatorView /> : <MemberView />;
}
