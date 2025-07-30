import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [alert, setAlert] = useState({ message: "", type: "" });
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
    image: null,
    previewImage: null,
  });

  useEffect(() => {
    api.get("/api/auth/me", { withCredentials: true }).then((res) => {
      setUserInfo(res.data);
    });
    fetchComplaints();
  }, []);

  const fetchComplaints = () => {
    api
      .get("/api/complaints", { withCredentials: true })
      .then((res) => {
        if (filter === "All") {
          setComplaints(res.data);
        } else {
          setComplaints(res.data.filter((c) => c.status === filter));
        }
      })
      .catch(() => setComplaints([]));
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({
        ...prev,
        image: files[0],
        previewImage: URL.createObjectURL(files[0]),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      previewImage: null,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.type || !formData.description) {
      setAlert({ message: "Please fill in all fields.", type: "fail" });
      return;
    }
    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("type", formData.type);
      payload.append("description", formData.description);

      if (formData.image) {
        payload.append("image", formData.image);
      } else if (selectedComplaint && !formData.previewImage) {
        payload.append("removeImage", "true");
      }

      const xsrf = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (selectedComplaint && selectedComplaint.status === "Pending") {
        await api.patch(`/api/complaints/${selectedComplaint._id}`, payload, {
          withCredentials: true,
          headers: { "X-XSRF-TOKEN": xsrf },
        });
      } else {
        await api.post("/api/complaints", payload, {
          withCredentials: true,
          headers: { "X-XSRF-TOKEN": xsrf },
        });
      }

      fetchComplaints();
      setAlert({
        message: selectedComplaint
          ? "Incident updated successfully."
          : "Incident created successfully.",
        type: "success",
      });
      setTimeout(() => setAlert({ message: "", type: "" }), 3000);
      setShowModal(false);
      setSelectedComplaint(null);
      setFormData({
        title: "",
        type: "",
        description: "",
        image: null,
        previewImage: null,
      });
    } catch (err) {
      console.error("Submit failed", err);
    }
  };

  const handleViewMore = (complaint) => {
    setSelectedComplaint(complaint);
    setFormData({
      title: complaint.title,
      type: complaint.type,
      description: complaint.description,
      image: null,
      previewImage: complaint.image
        ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${complaint.image}`
        : null,
    });
    setShowModal(true);
  };

  const handleFilterChange = (status) => {
    setFilter(status);
    setShowFilter(false);
    fetchComplaints();
  };

  const handleLogout = async () => {
    const xsrfToken = document.cookie
      .split("; ")
      .find((c) => c.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    await api.post(
      "/api/auth/logout",
      {},
      {
        withCredentials: true,
        headers: { "X-XSRF-TOKEN": xsrfToken },
      }
    );
    navigate("/login");
  };

  const isEditable =
    !selectedComplaint || selectedComplaint.status === "Pending";

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

      {alert.message && (
        <div className={`alert-${alert.type} alert-popup`}>{alert.message}</div>
      )}

      <main className="dashboard-main" style={{ padding: "1rem 2rem" }}>
        <div className="dashboard-header" style={{ marginBottom: "1rem" }}>
          <h1>User Dashboard</h1>
          <button
            className="submit-btn"
            onClick={() => {
              setSelectedComplaint(null);
              setFormData({
                title: "",
                type: "",
                description: "",
                image: null,
                previewImage: null,
              });
              setShowModal(true);
            }}
          >
            📥 Submit Incident
          </button>
        </div>

        {showModal && (
          <div className="modal">
            <h3>
              {selectedComplaint ? "View / Edit Incident" : "Submit Incident"}
            </h3>
            <input
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleInputChange}
              disabled={!isEditable}
            />
            <input
              name="type"
              placeholder="Type"
              value={formData.type}
              onChange={handleInputChange}
              disabled={!isEditable}
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={!isEditable}
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleInputChange}
              disabled={!isEditable}
            />
            {formData.previewImage && (
              <div>
                <img
                  src={formData.previewImage}
                  alt="preview"
                  style={{ maxWidth: "100%", marginBottom: "1rem" }}
                />
                {isEditable && (
                  <p
                    onClick={handleRemoveImage}
                    style={{
                      color: "#2563eb",
                      textDecoration: "underline",
                      cursor: "pointer",
                      marginTop: "0.5rem",
                    }}
                  >
                    ❌ Remove Image
                  </p>
                )}
              </div>
            )}
            <div className="modal-buttons">
              {isEditable && (
                <button onClick={handleSubmit}>
                  {selectedComplaint ? "Update" : "Submit"}
                </button>
              )}
              <button className="cancel" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            padding: "0 0.5rem",
          }}
        >
          <h2>📋 My Incidents</h2>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                padding: "0.5rem 1.2rem",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "0.9rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Filter ▾
            </button>
            {showFilter && (
              <div
                style={{
                  position: "absolute",
                  top: "110%",
                  right: 0,
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  padding: "0.5rem",
                  zIndex: 999,
                }}
              >
                {["All", "Pending", "In Progress", "Resolved", "Rejected"].map(
                  (status) => (
                    <div
                      key={status}
                      onClick={() => handleFilterChange(status)}
                      style={{
                        padding: "0.4rem 0.8rem",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {status}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
        <div className="incident-list">
          {complaints.map((c) => (
            <div key={c._id} className="incident-card">
              <div className="incident-info">
                <h3>{c.title}</h3>
                <p>
                  <strong>Type:</strong> {c.type}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      color:
                        c.status === "Pending"
                          ? "#2563eb"
                          : c.status === "In Progress"
                          ? "#ca8a04"
                          : c.status === "Resolved"
                          ? "#16a34a"
                          : c.status === "Rejected"
                          ? "#dc2626"
                          : "#374151",
                      fontWeight: 500,
                    }}
                  >
                    {c.status}
                  </span>
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "1rem",
                  }}
                >
                  <button onClick={() => handleViewMore(c)}>View More</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
