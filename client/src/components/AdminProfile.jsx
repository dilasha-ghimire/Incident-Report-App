import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./AdminProfile.css";
import "../components/AdminDashboard.css"; // Header/menu only

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [form, setForm] = useState({ username: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
  });

  const navigate = useNavigate();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/auth/me", { withCredentials: true });
      setProfile(res.data);
      setForm({ username: res.data.username, email: res.data.email });
    } catch {
      alert("Failed to load profile");
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await api.put("/api/auth/update-profile", form, {
        withCredentials: true,
        headers: { "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") },
      });
      setEditMode(false);
      fetchProfile();
    } catch {
      alert("Failed to update profile");
    }
  };

  const handlePasswordChange = async () => {
    try {
      await api.put("/api/auth/change-password", passwordForm, {
        withCredentials: true,
        headers: { "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") },
      });
      setPasswordMode(false);
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch {
      alert("Failed to change password");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="adminprofile-container">
      {/* Header */}
      <div className="admindashboard-header">
        <h2 style={{ flex: 1, textAlign: "left" }}>Admin Profile</h2>
        <div className="admindashboard-menu">
          <button
            className="admindashboard-menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            ☰
          </button>
          {showMenu && (
            <div className="admindashboard-dropdown">
              <div onClick={() => navigate("/admin/dashboard")}>
                Admin Dashboard
              </div>
              <div onClick={() => navigate("/admin/users")}>
                User Management
              </div>
              <div onClick={() => navigate("/admin/profile")}>Profile</div>
              <div onClick={() => navigate("/login")}>Logout</div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      {profile && (
        <div className="adminprofile-card">
          <p>
            <strong>Username:</strong> {profile.username}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Role:</strong> {profile.role}
          </p>
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
          <button onClick={() => setPasswordMode(true)}>Change Password</button>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editMode && (
        <div
          className="adminprofile-modal-overlay"
          onClick={() => setEditMode(false)}
        >
          <div
            className="adminprofile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Edit Profile</h3>
            <label>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <button onClick={handleProfileUpdate}>Save</button>
            <button onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordMode && (
        <div
          className="adminprofile-modal-overlay"
          onClick={() => setPasswordMode(false)}
        >
          <div
            className="adminprofile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Change Password</h3>
            <label>Current Password</label>
            <div className="adminprofile-password-input">
              <input
                type={showPassword.current ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
              />
              <span
                onClick={() =>
                  setShowPassword((p) => ({ ...p, current: !p.current }))
                }
              >
                {showPassword.current ? "🙈" : "👁️"}
              </span>
            </div>

            <label>New Password</label>
            <div className="adminprofile-password-input">
              <input
                type={showPassword.new ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
              />
              <span
                onClick={() => setShowPassword((p) => ({ ...p, new: !p.new }))}
              >
                {showPassword.new ? "🙈" : "👁️"}
              </span>
            </div>

            <button onClick={handlePasswordChange}>Update</button>
            <button onClick={() => setPasswordMode(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
