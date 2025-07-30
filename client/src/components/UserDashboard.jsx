import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./UserDashboard.css";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    api
      .get("/api/auth/me", { withCredentials: true })
      .then((res) => setUserInfo(res.data))
      .catch(() => setUserInfo(null));
  }, []);

  const handleLogout = async () => {
    try {
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
      };

      const xsrfToken = getCookie("XSRF-TOKEN");

      await api.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
          headers: {
            "X-XSRF-TOKEN": xsrfToken,
          },
        }
      );

      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <header className="home-header">
        <div className="home-logo" onClick={() => navigate("/")}>
          <img src="/logo.svg" alt="Logo" />
        </div>
        <div className="home-links">
          <button className="signin-btn" onClick={() => navigate("/profile")}>
            Profile
          </button>
          <button className="signin-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ textAlign: "center", marginTop: "4rem" }}>
        <h1>User Dashboard</h1>
        {userInfo ? (
          <>
            <p>
              <strong>Username:</strong> {userInfo.username}
            </p>
            <p>
              <strong>User ID:</strong> {userInfo.id}
            </p>
            <p>
              <strong>Role:</strong> {userInfo.role}
            </p>
          </>
        ) : (
          <p>No user data found. Please login.</p>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
