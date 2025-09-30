import { useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./components/Dashboard";
import Members from "./components/Members";
import Login from "./components/Login";
import Access from "./components/Access";
import KeyManagement from "./components/KeyManagement";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

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
          element: <KeyManagement/>
        }

      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;