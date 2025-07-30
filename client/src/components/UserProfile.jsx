import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./UserDashboard.css";
import "./UserProfile.css";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: "", email: "" });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });

  const [formData, setFormData] = useState({ username: "", email: "" });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    api.get("/api/auth/me", { withCredentials: true }).then((res) => {
      setUser(res.data);
      setFormData({ username: res.data.username, email: res.data.email });
    });
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const { username, email } = formData;
      if (!username || !email) {
        return setAlert({ message: "All fields are required", type: "fail" });
      }
      const xsrf = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      await api.put(
        "/api/auth/update-profile",
        { username, email },
        {
          withCredentials: true,
          headers: { "X-XSRF-TOKEN": xsrf },
        }
      );

      setAlert({ message: "Profile updated successfully", type: "success" });
      setTimeout(() => setAlert({ message: "", type: "" }), 3000);
      setUser((prev) => ({ ...prev, username, email }));
      setShowProfileModal(false);
    } catch (err) {
      setAlert({ message: "Profile update failed", type: "fail" });
      setTimeout(() => setAlert({ message: "", type: "" }), 3000);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return setAlert({
        message: "All password fields are required",
        type: "fail",
      });
    }
    if (newPassword !== confirmPassword) {
      return setAlert({ message: "Passwords do not match", type: "fail" });
    }

    try {
      const xsrf = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      await api.put(
        "/api/auth/change-password",
        { currentPassword, newPassword },
        {
          withCredentials: true,
          headers: { "X-XSRF-TOKEN": xsrf },
        }
      );

      setAlert({ message: "Password changed successfully", type: "success" });
      setTimeout(() => setAlert({ message: "", type: "" }), 3000);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordModal(false);
    } catch (err) {
      setAlert({
        message: err.response?.data?.error || "Password change failed",
        type: "fail",
      });
      setTimeout(() => setAlert({ message: "", type: "" }), 3000);
    }
  };

  return (
    <div className="profile-wrapper">
      <header className="home-header">
        <div className="home-logo" onClick={() => navigate("/")}>
          <img src="/logo.svg" alt="Logo" />
        </div>
        <div className="home-links">
          <button className="signin-btn" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-header">
          <h1>My Profile</h1>
          <div className="profile-modal-buttons">
            <button onClick={() => setShowProfileModal(true)}>
              Update Profile
            </button>
            <button onClick={() => setShowPasswordModal(true)}>
              Change Password
            </button>
          </div>
        </div>

        {alert.message && (
          <div
            className={`profile-alert-${alert.type} profile-alert-popup`}
            style={{
              position: "fixed",
              top: "1rem",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
            }}
          >
            {alert.message}
          </div>
        )}

        <div className="profile-box">
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>

        {showProfileModal && (
          <div className="profile-modal">
            <h3>Update Profile</h3>
            <input
              name="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Username"
            />
            <input
              name="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Email"
            />
            <div className="modal-buttons">
              <button onClick={handleUpdateProfile}>Update</button>
              <button
                className="cancel"
                onClick={() => setShowProfileModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showPasswordModal && (
          <div className="modal">
            <h3>Change Password</h3>
            <div className="password-wrapper">
              <input
                type={showPasswords.current ? "text" : "password"}
                placeholder="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
              />
              <span
                className="toggle-password"
                onClick={() =>
                  setShowPasswords((p) => ({ ...p, current: !p.current }))
                }
              >
                {showPasswords.current ? "👁️" : "🙈"}
              </span>
            </div>
            <div className="password-wrapper">
              <input
                type={showPasswords.new ? "text" : "password"}
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
              />
              <span
                className="toggle-password"
                onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
              >
                {showPasswords.new ? "👁️" : "🙈"}
              </span>
            </div>
            <div className="password-wrapper">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
              />
              <span
                className="toggle-password"
                onClick={() =>
                  setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))
                }
              >
                {showPasswords.confirm ? "👁️" : "🙈"}
              </span>
            </div>
            <div className="modal-buttons">
              <button onClick={handleChangePassword}>Change</button>
              <button
                className="cancel"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfile;
