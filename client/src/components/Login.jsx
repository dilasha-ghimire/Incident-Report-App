import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Login.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState("login"); // 'login' or 'otp'
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setAlert({ message: "All fields are required", type: "fail" });
      return;
    }

    try {
      await api.post("/api/auth/login", form, {
        withCredentials: true,
        headers: {
          "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
        },
      });

      setAlert({
        message: "OTP sent to your email. Please verify.",
        type: "success",
      });
      setStage("otp");
    } catch (err) {
      const message =
        err.response?.data?.error || "Login failed. Please try again.";
      setAlert({ message, type: "fail" });
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setAlert({ message: "OTP is required", type: "fail" });
      return;
    }

    try {
      const res = await api.post(
        "/api/auth/verify-login-otp",
        { email: form.email, otp },
        {
          withCredentials: true,
          headers: {
            "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
          },
        }
      );

      localStorage.setItem("token", res.data.token);
      setAlert({ message: "Login successful!", type: "success" });
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch {
      setAlert({ message: "Invalid or expired OTP", type: "fail" });
    }
  };

  useEffect(() => {
    api.get("/");
  }, []);

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

        <form
          className="login-right"
          onSubmit={stage === "login" ? handleLogin : handleVerifyOTP}
        >
          <h2>{stage === "login" ? "Sign In" : "Enter OTP"}</h2>

          {stage === "login" && (
            <>
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
            </>
          )}

          {stage === "otp" && (
            <>
              <input
                name="otp"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </>
          )}

          <button type="submit">
            {stage === "login" ? "Sign In" : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
