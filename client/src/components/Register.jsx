import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [alert, setAlert] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password) {
      setAlert({ message: "All fields are required", type: "fail" });
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      setAlert({ message: "Registration successful!", type: "success" });
    } catch {
      setAlert({ message: "Registration failed!", type: "fail" });
    }
  };

  // Auto-hide alert after 3 seconds
  // Auto-hide alert and redirect after 3 seconds if successful
  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => {
        setAlert({ message: "", type: "" });

        if (alert.type === "success") {
          navigate("/login");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert, navigate]);

  return (
    <div className="register-wrapper">
      <header className="home-header">
        <div className="home-logo" onClick={() => navigate("/")}>
          <img src="/logo.svg" alt="Logo" />
        </div>
        <div className="home-links">
          <button className="signin-btn" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </header>

      {/* 🔔 Alert Popup */}
      {alert.message && (
        <div className={`alert-${alert.type} alert-popup`}>
          Registration successful! Redirecting to login page.....
        </div>
      )}

      <div className="register-form">
        <div className="register-left">
          <h2>Welcome to Softwarica College</h2>
          <p>
            Use the Incident Reporting System to log campus issues easily,
            securely, and quickly.
          </p>
        </div>

        <form className="register-right" onSubmit={handleSubmit}>
          <h2>Sign Up</h2>
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
