import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ setIsLoggedIn, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [club, setClub] = useState("");
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔹 Fetch clubs list on mount
  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:8001/api/clubs/");
        if (!res.ok) throw new Error("Could not fetch clubs");
        const data = await res.json();

        setClubs(data.clubs); // ["robo", "kp", ...]
      } catch (err) {
        console.error(err);
        setError("Failed to load clubs.");
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  // 🔹 Call backend login API
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!club) {
      setError("Please select a club.");
      return;
    }
    if (!role) {
      setError("Please select a role.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8001/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          club_id: club, // send club identifier
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || data.error || "Login failed.");
        return;
      }

      // ✅ Success
      setIsLoggedIn(true);
      setUser(data.user); // comes from backend response
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Login to Your Account
        </h2>

        {loading && (
          <p className="text-center text-sm text-gray-500 mb-4">
            Loading clubs…
          </p>
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
              {clubs.map((c) => (
                <option key={c.club_id} value={c.club_id}>
                  {c.club_name}
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
