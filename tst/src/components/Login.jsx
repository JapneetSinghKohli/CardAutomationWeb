import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ setIsLoggedIn, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [club, setClub] = useState("");
  const [clubs, setClubs] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch data.json on mount
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/clubs.json");
        if (!res.ok) throw new Error("Could not fetch users");
        const data = await res.json();

        if (mounted) {
          setUsers(data); // entire object
          setClubs(Object.keys(data)); // clubs = keys
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load user data.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => (mounted = false);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (loading) {
      setError("User data still loading — try again in a moment.");
      return;
    }
    if (!club) {
      setError("Please select a club.");
      return;
    }
    if (!role) {
      setError("Please select a role.");
      return;
    }

    const clubUsers = users[club] || [];
    const found = clubUsers.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.role.toLowerCase() === role.toLowerCase()
    );

    if (!found) {
      setError("User not found for this club and role.");
      return;
    }

    if (found.password !== password) {
      setError("Incorrect password.");
      return;
    }

    // Success
    setIsLoggedIn(true);
    if (setUser)
      setUser({
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
        club,
      });

    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Login to Your Account
        </h2>

        {loading && (
          <p className="text-center text-sm text-gray-500 mb-4">Loading users…</p>
        )}
        {error && (
          <p className="text-red-500 text-center text-sm mb-4">{error}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-600 mb-2 text-sm font-medium">
              Club
            </label>
            <select
              value={club}
              onChange={(e) => setClub(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Select your club</option>
              {clubs.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-600 mb-2 text-sm font-medium">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Select your role</option>
              <option value="member">Member</option>
              <option value="coordinator">Coordinator</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-600 mb-2 text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-2 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}