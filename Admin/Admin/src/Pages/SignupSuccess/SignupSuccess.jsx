import React, { useEffect, useState } from "react";
import { CheckCircle, ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import confetti from 'canvas-confetti';
import "./SignupSuccess.css";

const SignupSuccess = () => {
  useEffect(() => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#22c55e', '#16a34a']
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#22c55e', '#16a34a']
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}, []);
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = location.state?.email || "your email";

  return (
    <div className="signup-success-wrapper">
      {/* Animated Background Blobs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      <div className="signup-success-card">
        <div className="status-badge">
          <ShieldCheck size={16} />
          <span>Verified Secure</span>
        </div>

        <div className="icon-wrapper">
          <div className="pulse-ring"></div>
          <CheckCircle size={80} className="success-icon" />
        </div>

        <div className="text-content">
          <h1>Account Created</h1>
          <p className="subtitle">Welcome to the inner circle, <strong>{userEmail}</strong>.</p>
          
          <div className="info-box">
            <Mail size={20} className="info-icon" />
            <p>A confirmation link has been sent to your inbox. Please check your spam folder if you don't see it.</p>
          </div>
        </div>

        <div className="action-area">
          <button
            className="primary-success-btn"
            onClick={() => navigate("/authentication")}
          >
            <span>Proceed to Login</span>
            <ArrowRight size={20} />
          </button>
          
          <button className="secondary-link" onClick={() => window.location.reload()}>
            Didn't get the email? Resend
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupSuccess;