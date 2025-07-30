import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./UserManagement.css";
import "../components/AdminDashboard.css"; // For header/menu only

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/admin/users", {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch {
      alert("Failed to load users");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/api/admin/users/${id}`, {
        withCredentials: true,
        headers: { "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") },
      });
      fetchUsers();
    } catch {
      alert("Delete failed");
    }
  };

  const handleSave = async () => {
    try {
      await api.put(
        `/api/admin/users/${editUser._id}`,
        {
          username: editUser.username,
          email: editUser.email,
          role: editUser.role,
        },
        {
          withCredentials: true,
          headers: { "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") },
        }
      );
      setEditUser(null);
      fetchUsers();
    } catch {
      alert("Update failed");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="adminuser-container">
      {/* Header/Menu from AdminDashboard.css */}
      <div className="admindashboard-header">
        <h2 style={{ flex: 1, textAlign: "left" }}>User Management</h2>
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

      {/* Search */}
      <div className="adminuser-searchbar">
        <input
          type="text"
          placeholder="Search username or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="adminuser-table-wrapper">
        <table className="adminuser-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => setEditUser(user)}>Edit</button>
                  <button onClick={() => handleDelete(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No matching users
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div
          className="adminuser-modal-overlay"
          onClick={() => setEditUser(null)}
        >
          <div className="adminuser-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit User</h3>
            <label>Username</label>
            <input
              type="text"
              value={editUser.username}
              onChange={(e) =>
                setEditUser({ ...editUser, username: e.target.value })
              }
            />
            <label>Email</label>
            <input
              type="email"
              value={editUser.email}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
            />
            <label>Role</label>
            <select
              value={editUser.role}
              onChange={(e) =>
                setEditUser({ ...editUser, role: e.target.value })
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setEditUser(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
