import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUser, setFilterUser] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const navigate = useNavigate();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const fetchReports = async () => {
    try {
      const res = await api.get("/api/admin/reports", {
        withCredentials: true,
      });
      setReports(res.data);
    } catch {
      alert("Failed to load reports");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(
        `/api/admin/reports/${id}`,
        { status: newStatus },
        {
          withCredentials: true,
          headers: {
            "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
          },
        }
      );
      fetchReports();
    } catch {
      alert("Failed to update status");
    }
  };

  const handleLogout = async () => {
    const xsrfToken = document.cookie
      .split("; ")
      .find((c) => c.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    try {
      await api.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
          headers: { "X-XSRF-TOKEN": xsrfToken },
        }
      );
      navigate("/login");
    } catch {
      alert("Logout failed");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    const matchesUser =
      filterUser === "" ||
      r.user?.username?.toLowerCase().includes(filterUser.toLowerCase());
    const matchesTitle =
      searchTitle === "" ||
      r.title.toLowerCase().includes(searchTitle.toLowerCase());
    return matchesStatus && matchesUser && matchesTitle;
  });

  const statusOptions = ["Pending", "In Progress", "Resolved", "Rejected"];

  return (
    <div className="admindashboard-container">
      <div className="admindashboard-header">
        <h2 style={{ flex: 1, textAlign: "left" }}>Admin Dashboard</h2>
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
              <div onClick={handleLogout}>Logout</div>
            </div>
          )}
        </div>
      </div>

      <div className="admindashboard-filters">
        <input
          placeholder="Search by username"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        />
        <input
          placeholder="Search by title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="admindashboard-table-wrapper">
        <table className="admindashboard-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>User</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((r) => (
              <tr key={r._id}>
                <td>{r.title}</td>
                <td>{r.user?.username || "N/A"}</td>
                <td>{r.status}</td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td>
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r._id, e.target.value)}
                    className="admindashboard-status-dropdown"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    className="admindashboard-view-btn"
                    onClick={() => setSelectedComplaint(r)}
                  >
                    View Complaint
                  </button>
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No matching reports
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedComplaint && (
        <div
          className="admindashboard-modal-overlay"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="admindashboard-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{selectedComplaint.title}</h3>
            <p>
              <strong>Type:</strong> {selectedComplaint.type || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {selectedComplaint.status}
            </p>
            <p>
              <strong>Submitted by:</strong>{" "}
              {selectedComplaint.user?.username || "N/A"}
            </p>
            <p>
              <strong>Description:</strong>
            </p>
            <p>{selectedComplaint.description}</p>
            <button onClick={() => setSelectedComplaint(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
