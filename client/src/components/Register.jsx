import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";
import api from "../api";
import "./Register.css";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState("register"); // 'register' or 'otp'
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [passwordStrength, setPasswordStrength] = useState(null);
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

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password) {
      return setAlert({ message: "All fields are required", type: "fail" });
    }

    if (isWeakPassword(form.password)) {
      return setAlert({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
        type: "fail",
      });
    }

    try {
      await api.post("/api/auth/register", form, {
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
    } catch {
      setAlert({ message: "Registration failed!", type: "fail" });
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      return setAlert({ message: "OTP is required", type: "fail" });
    }

    try {
      await api.post(
        "/api/auth/verify-email",
        { email: form.email, otp },
        {
          withCredentials: true,
          headers: {
            "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
          },
        }
      );

      setAlert({ message: "Email verified successfully!", type: "success" });
      setTimeout(() => navigate("/login"), 3000);
    } catch {
      setAlert({ message: "Invalid or expired OTP", type: "fail" });
    }
  };

  useEffect(() => {
    api.get("/");
  }, []);

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

        <form
          className="register-right"
          onSubmit={stage === "register" ? handleRegister : handleVerifyOTP}
        >
          <h2>{stage === "register" ? "Sign Up" : "Verify Email"}</h2>

          {stage === "register" && (
            <>
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
                  onChange={(e) => {
                    handleChange(e);
                    const score = zxcvbn(e.target.value).score;
                    setPasswordStrength(score);
                  }}
                />
                <span className="toggle-password" onClick={togglePassword}>
                  {showPassword ? "👁️" : "🙈"}
                </span>
              </div>

              {form.password && (
                <div className="password-strength">
                  <div
                    className={`strength-bar strength-${passwordStrength}`}
                  />
                  <span>
                    {
                      ["Very Weak", "Weak", "Fair", "Good", "Strong"][
                        passwordStrength
                      ]
                    }
                  </span>
                </div>
              )}
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
            {stage === "register" ? "Sign Up" : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
