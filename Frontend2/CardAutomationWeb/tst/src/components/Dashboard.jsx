import React, { useState, useEffect } from "react";
import { IconKey, IconUsers, IconActivity, IconTrendingUp, IconClock, IconMapPin } from "@tabler/icons-react";

function StatCard({ title, value, subtitle, icon: Icon, gradient }) {
  return (
    <div className={`w-full rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-br ${gradient} p-6 shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="mt-3 text-4xl font-bold text-white">{value}</p>
          <p className="mt-2 text-sm text-white/70">{subtitle}</p>
        </div>
        <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  const getInitial = (name) => (name || "U")[0].toUpperCase();

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
        {getInitial(activity.user)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          <span className="font-semibold">{activity.user}</span> {activity.action} key
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <IconMapPin className="h-3 w-3" />
            {activity.location}
          </span>
          <span className="flex items-center gap-1">
            <IconClock className="h-3 w-3" />
            {new Date(activity.time).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ user }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8001/api/dashboard/`)
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  const getStatusClasses = (status) => {
    if (status === "available") {
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
    }
    else if (status === "in_use") {
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    }
    else if (status === "maintenance") {
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
    }
    else {
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  if (data == null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-transparent dark:text-white transition-colors duration-300">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome Back, {user?.name || "User"}!</h1>
            <p className="text-white/80 mt-1">Manage keys and members for your club</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Keys"
          value={data.key.total}
          subtitle={`${data.key.available} available`}
          icon={IconKey}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Available"
          value={data.key.available}
          subtitle="Ready to use"
          icon={IconTrendingUp}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="In Use"
          value={data.key.in_use}
          subtitle="Currently active"
          icon={IconActivity}
          gradient="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Maintenance"
          value={data.key.maintenance}
          subtitle="Under repair"
          icon={IconUsers}
          gradient="from-red-500 to-red-600"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Status */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Key Status</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Current status of all keys</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <IconKey className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(data.key_status).slice(0, 4).map(([club, status], idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-700 transition-colors">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{club}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Slot {idx + 1}</p>
                </div>
                <span
                  className={`px-4 py-2 text-sm font-semibold rounded-full border ${getStatusClasses(status)}`}
                >
                  {status === "in_use" ? "In Use" : status === "available" ? "Available" : "Maintenance"}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => window.location.href = "/key-management"}
            className="mt-6 w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            Manage All Keys
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest key transactions</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
              <IconActivity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          <div className="space-y-2">
            {data.recent_activity.slice(0, 4).map((activity, idx) => (
              <ActivityItem key={idx} activity={activity} />
            ))}
          </div>

          <button
            onClick={() => window.location.href = "/access"}
            className="mt-6 w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
          >
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}