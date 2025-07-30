import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./UserDashboard.css";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
    image: null,
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
      .then((res) => setComplaints(res.data))
      .catch(() => setComplaints([]));
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("type", formData.type);
      payload.append("description", formData.description);
      if (formData.image) payload.append("image", formData.image);

      const xsrf = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      await api.post("/api/complaints", payload, {
        withCredentials: true,
        headers: { "X-XSRF-TOKEN": xsrf },
      });

      fetchComplaints();
      setShowModal(false);
      setFormData({ title: "", type: "", description: "", image: null });
    } catch (err) {
      console.error("Submit failed", err);
    }
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

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>User Dashboard</h1>
          <button className="submit-btn" onClick={() => setShowModal(true)}>
            📥 Submit Incident
          </button>
        </div>

        {showModal && (
          <div className="modal">
            <h3>Submit Incident</h3>
            <input
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleInputChange}
            />
            <input
              name="type"
              placeholder="Type"
              value={formData.type}
              onChange={handleInputChange}
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleInputChange}
            />
            <button onClick={handleSubmit}>Submit</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        )}

        <h2 style={{ marginTop: "3rem" }}>📋 My Incidents</h2>
        {complaints.map((c) => (
          <div
            key={c._id}
            style={{
              borderBottom: "1px solid #ccc",
              margin: "1rem auto",
              maxWidth: "600px",
            }}
          >
            <h3>{c.title}</h3>
            <p>
              <strong>Type:</strong> {c.type}
            </p>
            <p>{c.description}</p>
            <p>
              <strong>Status:</strong> {c.status}
            </p>
            {c.image && (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${c.image}`}
                alt="incident"
                style={{ maxWidth: "100%", maxHeight: "200px" }}
              />
            )}
          </div>
        ))}
      </main>
    </div>
  );
};

export default UserDashboard;
