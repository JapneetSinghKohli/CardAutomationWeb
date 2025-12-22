import React from "react";
import { Outlet } from "react-router-dom";
import Navb from "./components/Navb";

function Layout({ isLoggedIn, setIsLoggedIn, user, setUser }) {
  return (
    <div>
      <Navb
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        user={user}
        setUser={setUser}
      />
      <Outlet />
    </div>
  );
}

export default Layout;