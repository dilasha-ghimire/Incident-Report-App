import React from "react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

const UserDashboard = () => {
  const navigate = useNavigate();

  // 👤 Get token and decode payload
  const token = localStorage.getItem("token");
  let userInfo = null;

  try {
    if (token) {
      const base64Payload = token.split(".")[1];
      const decodedPayload = atob(base64Payload);
      userInfo = JSON.parse(decodedPayload);
    }
  } catch {
    userInfo = null;
  }

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
          <button
            className="signin-btn"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ textAlign: "center", marginTop: "4rem" }}>
        <h1>User Dashboard</h1>
        {userInfo ? (
          <>
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
