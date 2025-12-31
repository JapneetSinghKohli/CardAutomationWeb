import { useState } from "react";
import { Squash as Hamburger } from "hamburger-react";
import { Link, NavLink } from "react-router-dom";
import { IconKey, IconLogout, IconChevronDown, IconUser, IconSettings, IconSun, IconMoon } from "@tabler/icons-react";
import { useTheme } from "../context/ThemeContext";

export default function Navb({ isLoggedIn, setIsLoggedIn, user, setUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const getUserInitial = () => {
    return (user?.name || "U")[0].toUpperCase();
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-white/95 dark:bg-gray-900/95 transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-12 w-full">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <IconKey className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              KeyFlow
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-1 items-center">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium transition-all ${isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/key-management"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium transition-all ${isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              Key Management
            </NavLink>

            {/* Dropdown */}
            <div
              className="relative py-4"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="px-4 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all flex items-center gap-1">
                Access
                <IconChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 top-full w-56 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <NavLink
                    to="/access"
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-b border-gray-100 dark:border-gray-700"
                  >
                    Access Logs
                  </NavLink>
                  <a href="#" className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-b border-gray-100 dark:border-gray-700">
                    Access Requests
                  </a>
                  <a href="#" className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    NFC Access
                  </a>
                </div>
              )}
            </div>

            <NavLink
              to="/members"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium transition-all ${isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              Members
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium transition-all ${isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`
              }
            >
              Settings
            </NavLink>
          </div>

          {/* Right: Toggle & Auth section */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? <IconMoon size={20} /> : <IconSun size={20} />}
            </button>

            {!isLoggedIn ? (
              <NavLink
                to="/login"
                className="px-6 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Log in
              </NavLink>
            ) : (
              <div className="flex items-center gap-4">
                {/* User Profile */}
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {getUserInitial()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{user?.name || "User"}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize mt-1">{user?.role || "Member"}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-2"
                >
                  <IconLogout className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              {theme === "light" ? <IconMoon size={20} /> : <IconSun size={20} />}
            </button>
            <Hamburger size={24} toggled={isOpen} toggle={setIsOpen} color={theme === "dark" ? "#ffffff" : "#000000"} />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-1 border-t border-gray-100">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg font-medium ${isActive
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/key-management"
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg font-medium ${isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
              }`
            }
          >
            Key Management
          </NavLink>

          {/* Mobile Dropdown */}
          <div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full px-4 py-3 rounded-lg text-left font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between"
            >
              Access
              <IconChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="ml-4 mt-1 space-y-1">
                <NavLink to="/access" className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Access Logs
                </NavLink>
                <a href="#" className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Access Requests
                </a>
                <a href="#" className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                  NFC Access
                </a>
              </div>
            )}
          </div>

          <NavLink
            to="/members"
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg font-medium ${isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
              }`
            }
          >
            Members
          </NavLink>

          <a href="#" className="block px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            Settings
          </a>

          {/* Mobile Auth */}
          {!isLoggedIn ? (
            <div className="pt-3">
              <Link
                to="/login"
                className="block w-full text-center px-4 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Log in
              </Link>
            </div>
          ) : (
            <div className="pt-3 space-y-2">
              {/* User Info */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {getUserInitial()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{user?.name || "User"}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role || "Member"}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-lg font-medium text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center gap-2"
              >
                <IconLogout className="h-5 w-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}