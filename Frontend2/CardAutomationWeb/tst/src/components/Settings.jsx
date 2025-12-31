import React, { useState } from "react";
import {
    IconUser,
    IconLock,
    IconMail,
    IconShield,
    IconBell,
    IconPalette,
    IconKey,
    IconLogout
} from "@tabler/icons-react";

export default function Settings({ user, setUser, setIsLoggedIn }) {
    const [activeTab, setActiveTab] = useState("profile");
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://127.0.0.1:8001/api/profile/update/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    name: formData.name
                })
            });
            const result = await res.json();
            if (res.ok) {
                alert("Profile updated successfully!");
                // Update local user state
                const updatedUser = { ...user, name: formData.name };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser)); // Persist change
            } else {
                alert(result.error || "Failed to update profile");
            }
        } catch (err) {
            console.error(err);
            alert("Network error updating profile");
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:8001/api/password/change/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    current_password: formData.currentPassword,
                    new_password: formData.newPassword
                })
            });
            const result = await res.json();
            if (res.ok) {
                alert("Password changed successfully! Please log in again.");
                setIsLoggedIn(false); // Force re-login for security
                setUser(null);
            } else {
                alert(result.error || "Failed to change password");
            }
        } catch (err) {
            console.error(err);
            alert("Network error changing password");
        }
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: IconUser },
        { id: "security", label: "Security", icon: IconShield },
        { id: "notifications", label: "Notifications", icon: IconBell },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account preferences and settings</p>
            </div>

            {/* User Info Card */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold border border-white/30">
                        {(user?.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user?.name || "User"}</h2>
                        <p className="text-white/80">{user?.email || "user@example.com"}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold capitalize border border-white/10">
                                {user?.role || "Member"}
                            </span>
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold border border-white/10">
                                Club ID: {user?.club_id || "N/A"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex gap-4">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === tab.id
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700"
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                {activeTab === "profile" && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Profile Information</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Update your account profile information</p>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                <div className="relative">
                                    <IconUser className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                <div className="relative">
                                    <IconMail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400"
                                        placeholder="Enter your email"
                                        disabled
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact administrator.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Role</label>
                                <input
                                    type="text"
                                    value={user?.role || "Member"}
                                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 capitalize"
                                    disabled
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                Save Changes
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === "security" && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Change Password</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Update your password to keep your account secure</p>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                                <div className="relative">
                                    <IconLock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter current password"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                <div className="relative">
                                    <IconKey className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter new password"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <IconKey className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                Update Password
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === "notifications" && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Notification Preferences</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Manage how you receive notifications</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { title: "Key Activity Alerts", desc: "Get notified when keys are taken or returned" },
                                { title: "Access Requests", desc: "Notifications for new access requests" },
                                { title: "Maintenance Updates", desc: "Alerts when keys go into maintenance" },
                                { title: "Email Notifications", desc: "Receive email summaries of activity" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
