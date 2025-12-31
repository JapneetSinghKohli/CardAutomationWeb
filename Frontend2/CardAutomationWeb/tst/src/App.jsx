import { useState, useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./components/Dashboard";
import Members from "./components/Members";
import Login from "./components/Login";
import Access from "./components/Access";
import KeyManagement from "./components/KeyManagement";
import ResetPassword from "./components/ResetPassword";
import Settings from "./components/Settings";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [isLoggedIn, user]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Layout
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          user={user}
          setUser={setUser}
        />
      ),
      children: [
        { path: "", element: <Dashboard user={user} /> },
        { path: "members", element: <Members user={user} /> },
        {
          path: "login",
          element: (
            <Login
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
            />
          ),
        },
        {
          path: "access",
          element: <Access user={user} />
        },
        {
          path: "key-management",
          element: <KeyManagement user={user} />
        },
        {
          path: "reset-password",
          element: <ResetPassword />
        },
        {
          path: "settings",
          element: <Settings user={user} setUser={setUser} setIsLoggedIn={setIsLoggedIn} />
        }

      ],
    },
  ]);

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;