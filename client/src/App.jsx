import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Homepage from "./components/Homepage";
import Login from "./components/Login";
import Register from "./components/Register";
import UserDashboard from "./components/UserDashboard";
import UserProfile from "./components/UserProfile";

import AdminDashboard from "./components/AdminDashboard";
import UserManagement from "./components/UserManagement";
import AdminProfile from "./components/AdminProfile";

import api from "./api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/api/auth/me", {
          withCredentials: true,
        });
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  if (loading) return <div>Loading...</div>;

  const isAdmin = user?.role === "admin";

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<UserProfile />} />

        {/* Admin Routes (RBAC check) */}
        <Route
          path="/admin/dashboard"
          element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/users"
          element={isAdmin ? <UserManagement /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/profile"
          element={isAdmin ? <AdminProfile /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
