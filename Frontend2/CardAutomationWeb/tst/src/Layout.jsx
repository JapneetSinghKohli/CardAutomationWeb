import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navb from "./components/Navb";

function Layout({ isLoggedIn, setIsLoggedIn, user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If not logged in and trying to access anything other than login or reset-password, redirect
    if (!isLoggedIn && location.pathname !== "/login" && location.pathname !== "/reset-password") {
      navigate("/login");
    }
    // If logged in and at login page, redirect to dashboard
    if (isLoggedIn && location.pathname === "/login") {
      navigate("/");
    }
  }, [isLoggedIn, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Navb
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        user={user}
        setUser={setUser}
      />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;