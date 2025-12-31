import React from 'react'
import { useState, useEffect } from "react";
import { IconUserPlus, IconUser, IconSearch, IconMail, IconCalendar, IconShield, IconUsers } from '@tabler/icons-react';

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

function MemberCard({ member, isCoordinator, onRemove }) {
  const roleConfig = {
    coordinator: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', gradient: 'from-purple-500 to-purple-600' },
    member: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', gradient: 'from-blue-500 to-blue-600' },
    admin: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', gradient: 'from-indigo-500 to-indigo-600' }
  };
  const roleStyle = roleConfig[member.role?.toLowerCase()] || roleConfig.member;

  return (
    <div className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center gap-4">
          {/* Gradient Avatar */}
          <div className={`h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-br ${roleStyle.gradient} text-xl font-bold text-white shadow-lg`}>
            {member.name ? member.name.slice(0, 2).toUpperCase() : "??"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {member.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
              <IconMail size={14} /> <span>{member.email}</span>
            </p>
          </div>
        </div>

        {/* Status + Role */}
        <div className="flex items-center gap-2">
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border-2 ${member.active
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
              }`}
          >
            {member.active ? "Active" : "Inactive"}
          </span>
          <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border-2 ${roleStyle.bg} ${roleStyle.text} border-transparent dark:border-opacity-0 capitalize`}>
            {member.role}
          </span>
        </div>
      </div>

      {/* Info section */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <IconCalendar size={16} className="text-blue-500" />
          <p className="text-sm font-medium">Joined: <span className="text-gray-900 dark:text-gray-100">{member.Joined}</span></p>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <IconUser size={16} className="text-purple-500" />
          <p className="text-sm font-medium">Role: <span className="text-gray-900 dark:text-gray-100 capitalize">{member.role}</span></p>
        </div>
      </div>

      {/* Actions - Role Restricted */}
      {isCoordinator && member.role?.toLowerCase() === "member" && (
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={() => onRemove(member.user_id)}
            className="px-4 py-2 rounded-lg border-2 border-red-300 text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-400 transition-all"
          >
            Remove Member
          </button>
        </div>
      )}
    </div>
  );
}


function Members({ user }) {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Member Form State
  const [newMember, setNewMember] = useState({ name: "", email: "", password: "password123", role: "Member" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // Pagination State
  const [visibleCount, setVisibleCount] = useState(4);
  const handleViewMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  const handleViewLess = () => {
    setVisibleCount(4);
  };

  const fetchMembers = async () => {
    if (!user) return;

    try {
      const res = await fetch(`http://127.0.0.1:8001/api/members/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      const members = await res.json();
      setData(members);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [user]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");

    try {
      const res = await fetch("http://127.0.0.1:8001/api/members/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requester_id: user.id,
          club_id: user.club_id,
          ...newMember
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to add member");
      }

      // Success
      setShowAddModal(false);
      setNewMember({ name: "", email: "", password: "password123", role: "Member" });
      fetchMembers(); // refresh list

    } catch (err) {
      setAddError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8001/api/members/remove/${memberId}/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requester_id: user.id,
          club_id: user.club_id
        })
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to remove member");
      }
      fetchMembers(); // refresh
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user || data === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const isCoordinator = user.role.toLowerCase() === "coordinator";

  const filteredData = Array.isArray(data)
    ? data.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.user_id.toLowerCase().includes(search.toLowerCase())
    )
    : [];

  return (
    <div>
      <div className='flex items-center justify-between ml-3 mt-7'>
        <div className=' text-3xl font-bold text-gray-900 dark:text-white'>
          Member Management
        </div>
        {isCoordinator && (
          <button
            onClick={() => setShowAddModal(true)}
            className=' hidden md:flex md:bg-black md:mr-5 md:text-white md:px-4 md:py-2 md:rounded-md md:hover:cursor-pointer md:hover:bg-gray-600'>
            <div className='flex items-center space-x-2'>
              <IconUserPlus size={20} />
              <p className='text-md font-medium'>
                Add Member
              </p>
            </div>
          </button>
        )}
      </div>
      <p className='ml-3 mt-2 text-md text-gray-600 dark:text-gray-400'>
        Manage your club members and their roles.
      </p>
      <div className="grid grid-cols-2 gap-6 p-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={data?.length || 0}
          icon={IconUsers}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Active Members"
          value={Array.isArray(data) ? data.filter(m => m.active).length : 0}
          icon={IconUser}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Coordinators"
          value={Array.isArray(data) ? data.filter(m => m.role?.toLowerCase() === "coordinator").length : 0}
          icon={IconShield}
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Members"
          value={Array.isArray(data) ? data.filter(m => m.role?.toLowerCase() === "member").length : 0}
          icon={IconUser}
          gradient="from-indigo-500 to-indigo-600"
        />

      </div>
      <div className=" flex flex-col md:flex-row items-center md:justify-between mt-2">
        <p className="w-full p-1 pl-4 text-2xl font-bold text-gray-900 dark:text-white">
          Club Members
        </p>
        <div className=" w-full md:w-4/10  mx-auto px-5 py-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/4 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>
      <div className='w-full px-3 items-center mx-auto '>
        <div className="flex flex-col items-center gap-4 md:grid md:gap-6 md:grid-cols-2 lg:grid-cols-2">
          {filteredData.slice(0, visibleCount).map((member, index) => (
            <MemberCard
              key={index}
              member={member}
              isCoordinator={isCoordinator}
              onRemove={handleRemoveMember}
            />
          ))}
        </div>

        {/* View More / View Less Buttons */}
        <div className="flex justify-center gap-4 mt-8 mb-4">
          {filteredData.length > visibleCount && (
            <button
              onClick={handleViewMore}
              className="px-6 py-2 bg-blue-600 dark:bg-blue-700 rounded-lg text-sm font-semibold text-white shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 hover:shadow-md transition-all flex items-center gap-2"
            >
              View More <span className="text-blue-200 text-xs">({filteredData.length - visibleCount} remaining)</span>
            </button>
          )}

          {visibleCount > 4 && (
            <button
              onClick={handleViewLess}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-300 dark:hover:bg-gray-700 hover:shadow-md transition-all flex items-center gap-2"
            >
              View Less
            </button>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Member</h3>
            {addError && <p className="text-red-500 text-sm mb-2">{addError}</p>}
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={newMember.name}
                  onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="example@students.iitmandi.ac.in"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={newMember.email}
                  onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Password</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  value={newMember.password}
                  onChange={e => setNewMember({ ...newMember, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  value={newMember.role}
                  onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                >
                  <option value="Member">Member</option>
                  <option value="Coordinator">Coordinator</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {addLoading ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!isCoordinator && filteredData.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No members found.</p>
      )}
    </div>
  )
}

export default Members