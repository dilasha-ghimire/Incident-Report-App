import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setAlert({ message: "All fields are required", type: "fail" });
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        form
      );
      localStorage.setItem("token", res.data.token);
      setAlert({ message: "Login successful!", type: "success" });
    } catch (err) {
      const message =
        err.response?.data?.error || "Login failed. Please try again.";
      setAlert({ message, type: "fail" });
    }
  };

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => {
        setAlert({ message: "", type: "" });
        if (alert.type === "success") {
          navigate("/dashboard");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert, navigate]);

  return (
    <div className="login-wrapper">
      <header className="home-header">
        <div className="home-logo" onClick={() => navigate("/")}>
          <img src="/logo.svg" alt="Logo" />
        </div>
        <div className="home-links">
          <button className="signin-btn" onClick={() => navigate("/register")}>
            Sign Up
          </button>
        </div>
      </header>

      {alert.message && (
        <div className={`alert-${alert.type} alert-popup`}>{alert.message}</div>
      )}

      <div className="login-form">
        <div className="login-left">
          <h2>Welcome Back</h2>
          <p>
            Access the Softwarica Incident Reporting System to manage, submit,
            and monitor reports securely.
          </p>
        </div>

        <form className="login-right" onSubmit={handleSubmit}>
          <h2>Sign In</h2>
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
          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
