import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconMail,
  IconLock,
  IconBuildingCommunity,
  IconUser,
  IconLogin,
  IconKey
} from "@tabler/icons-react";

export default function Login({ setIsLoggedIn, setUser }) {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Member"); // Default to Member
  const [club, setClub] = useState("");
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [recoveryLink, setRecoveryLink] = useState("");
  const navigate = useNavigate();

  // 🔹 Fetch clubs list on mount
  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:8001/api/clubs/");
        if (!res.ok) throw new Error("Could not fetch clubs");
        const data = await res.json();
        setClubs(data.clubs);
        if (data.clubs.length > 0) {
          setClub(data.clubs[0].club_id); // Auto-select first club
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load clubs. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  // 🔹 Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!club) return setError("Please select a club.");

    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8001/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          club_id: club,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Login failed.");
      }

      // ✅ Success
      setIsLoggedIn(true);
      const userData = { ...data.user, role }; // Ensure role is preserved locally
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData)); // Persist session
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email) return setError("Please enter your email.");

    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8001/api/forgot-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "Password reset email sent! Check your inbox.");
        if (data.debug_link) {
          setRecoveryLink(data.debug_link);
          console.log("DEV RECOVERY LINK:", data.debug_link);
        }
      } else {
        setError(data.error || "Failed to send reset email.");
        if (data.debug_link) setRecoveryLink(data.debug_link);
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Left Side - Hero/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-blue-600">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8 p-4 bg-white/10 backdrop-blur-md rounded-2xl w-fit">
            <IconKey size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Secure Access <br /> Simplified.
          </h1>
          <p className="text-xl text-blue-100 max-w-md leading-relaxed">
            Manage keys, track access logs, and handle member permissions all in one place with KeyFlow.
          </p>

          <div className="mt-12 flex items-center gap-4 text-sm text-blue-200">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-blue-600"></div>
              ))}
            </div>
            <p>Used by leading student clubs</p>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-200 dark:shadow-none">
              <IconKey size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">KeyFlow</h2>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isForgotPassword ? "Reset Password" : "Welcome Back"}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {isForgotPassword
                ? "Enter your email to receive recovery instructions."
                : "Please enter your details to sign in."}
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-shake">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
              {successMsg}
            </div>
          )}

          {!isForgotPassword ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Club Selection */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Club</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconBuildingCommunity className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={club}
                    onChange={(e) => setClub(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none"
                  >
                    <option value="" disabled className="dark:bg-gray-900">Select a club</option>
                    {clubs.map((c) => (
                      <option key={c.club_id} value={c.club_id} className="dark:bg-gray-900">
                        {c.club_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-3">
                {['Member', 'Coordinator'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-4 rounded-lg text-sm font-medium border transition-all ${role === r
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 shadow-sm'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="you@iitmandi.ac.in"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setError(""); setSuccessMsg(""); }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-200 dark:shadow-none text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <IconLogin size={18} />
                  </span>
                )}
              </button>
            </form>
          ) : (
            /* FORGOT PASSWORD FORM */
            <form onSubmit={handleForgotPassword} className="space-y-6">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-200 dark:shadow-none text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Send Recovery Link"
                )}
              </button>

              {recoveryLink && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center animate-pulse">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Email taking too long?</p>
                  <a
                    href={recoveryLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-700 dark:hover:bg-blue-800 transition-all shadow-md"
                  >
                    Click to Reset Password (Dev Mode)
                  </a>
                  <p className="mt-2 text-[10px] text-blue-400 dark:text-blue-500">This link is only visible in development environments.</p>
                </div>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setError(""); setSuccessMsg(""); }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium inline-flex items-center gap-1"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
            © 2024 KeyFlow Automation. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
