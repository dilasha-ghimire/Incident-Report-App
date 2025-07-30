import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Homepage.css";

const Homepage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has("token")) {
      params.delete("token");
      navigate({ pathname: "/", search: params.toString() }, { replace: true });
    }
  }, [location, navigate]);

  const images = [
    "/homepage-illustration-1.png",
    "/homepage-illustration-2.png",
    "/homepage-illustration-3.png",
    "/homepage-illustration-4.png",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="home-wrapper">
      <header className="home-header">
        <div className="home-logo" onClick={() => navigate("/")}>
          <img src="/logo.svg" alt="Logo" />
        </div>

        <div className="home-links">
          <a
            href="https://softwarica.edu.np/"
            target="_blank"
            rel="noopener noreferrer"
          >
            College Site
          </a>
          <a
            href="https://c4mpus.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Student Portal
          </a>
          <button className="signin-btn" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </header>

      <main className="home-content">
        <div className="home-text">
          <h1>
            Stay Safe. <span className="highlight">Report Easily.</span>
          </h1>
          <p>
            Softwarica Incident Reporting System lets you securely log and track
            issues around campus. Simple, fast, and responsive.
          </p>
          <button className="cta-btn" onClick={() => navigate("/register")}>
            Get Started
          </button>
        </div>

        <div className="home-image slideshow-container">
          {images.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Slide ${index + 1}`}
              className={`slide-image ${
                index === currentIndex ? "active" : ""
              }`}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Homepage;
