import React from "react";

export default function Access({ user }) {
  if (!user) {
    return (
      <div className="p-6 text-center text-red-500">
        <h2>You must be logged in to view this page.</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      {user.role === "coordinator" ? (
        
        <div>
          <h2 className="text-2xl font-bold mb-4">Coordinator Dashboard</h2>
          <p className="text-gray-700">You have access to:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>View and manage members</li>
            <li>Approve access requests</li>
            <li>View access logs</li>
            <li>Grant permissions</li>
          </ul>
        </div>
      ) : (
        
        <div>
          <h2 className="text-2xl font-bold mb-4">Member Access</h2>
          <p className="text-gray-700">You have access to:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>View your permissions</li>
            <li>Request access</li>
            <li>Check announcements</li>
          </ul>
        </div>
      )}
    </div>
  );
}
