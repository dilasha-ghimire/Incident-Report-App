import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  const isWeakPassword = (password) => {
    return (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password) {
      setAlert({ message: "All fields are required", type: "fail" });
      return;
    }

    if (isWeakPassword(form.password)) {
      setAlert({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
        type: "fail",
      });
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`,
        form
      );
      setAlert({ message: "Registration successful!", type: "success" });
    } catch {
      setAlert({ message: "Registration failed!", type: "fail" });
    }
  };

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
        <div className={`alert-${alert.type} alert-popup`}>{alert.message}</div>
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
          <div className="password-wrapper">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            <span className="toggle-password" onClick={togglePassword}>
              {showPassword ? "👁️" : "🙈"}
            </span>
          </div>
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
