import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// We need a supabase client here to handle the password update
// Or we can send the new password to backend. 
// Standard Supabase flow: Click link -> Redirect to App -> App gets session -> User updates password.
// But we are using backend for everything? 
// Actually, the link contains an access_token. Supabase client detects it.
// So we need a minimal supabase client in frontend OR send the hash to backend.
// Simplest: Send new password to backend `update_password` endpoint with the token?
// Default Supabase link: /reset-password#access_token=...&type=recovery
// Easier to let Supabase Client handle session recovery then just call "updateUser".

// Let's assume we don't have supabase client in frontend (we removed it?). 
// Wait, we do not have supabase in package.json dependencies in Frontend2? 
// I checked package.json earlier (step 34). It has specific deps. 
// "dependencies": { ... }, NO @supabase/supabase-js.
// So we CANNOT use supabase client in frontend easily without installing it.
// BUT we can parse the hash fragment for access_token.
// And call backend.

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const handleReset = async (e) => {
        e.preventDefault();
        // Logic to update password
        // We need the token. The token is in the URL hash.
        // Supabase puts it in #access_token=...

        const hash = location.hash;
        const params = new URLSearchParams(hash.substring(1)); // remove #
        const accessToken = params.get("access_token");

        if (!accessToken) {
            setError("Invalid or missing recovery token.");
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:8001/api/reset-password-confirm/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({ password })
            });
            const data = await res.json();

            if (data.success) {
                setMsg("Password updated! Redirecting to login...");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setError(data.error || "Failed");
            }
        } catch (err) {
            setError(err.message || String(err));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Set New Password</h2>
                {error && <p className="text-red-500 dark:text-red-400 mb-2">{error}</p>}
                {msg && <p className="text-green-500 dark:text-green-400 mb-2">{msg}</p>}

                <form onSubmit={handleReset}>
                    <input
                        type="password"
                        placeholder="New Password"
                        className="w-full pl-3 pr-3 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none mb-4"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none">Update Password</button>
                </form>
            </div>
        </div>
    );
}
