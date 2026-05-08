import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import learnerApi from "../Utils/learnerApi";
import teacherApi from "../Utils/teacherApi";
import "../Css/LearnerPortal.css";

const PortalForgotPassword = ({ portal }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const api = portal === "teacher" ? teacherApi : learnerApi;
  const base = portal === "teacher" ? "/teachers" : "/learn";
  const loginPath = portal === "teacher" ? "/teacher/login" : "/learn/login";

  const submit = async (event) => {
    event.preventDefault();
    const res = await api.post(`${base}/auth/forgot-password`, { email });
    setMessage(res.data.message);
  };

  return (
    <main className="learn-auth-page">
      <section className="learn-auth-panel">
        <h1>Reset Password</h1>
        <p>Enter your {portal} email. We will send a secure reset link.</p>
        <form onSubmit={submit} className="learn-auth-form">
          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button type="submit">Send Reset Link</button>
        </form>
        {message && <p>{message}</p>}
        <Link to={loginPath}>Back to login</Link>
      </section>
    </main>
  );
};

export const PortalResetPassword = ({ portal }) => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const api = portal === "teacher" ? teacherApi : learnerApi;
  const base = portal === "teacher" ? "/teachers" : "/learn";
  const loginPath = portal === "teacher" ? "/teacher/login" : "/learn/login";

  const submit = async (event) => {
    event.preventDefault();
    const res = await api.post(`${base}/auth/reset-password/${token}`, { password });
    setMessage(res.data.message);
  };

  return (
    <main className="learn-auth-page">
      <section className="learn-auth-panel">
        <h1>Choose New Password</h1>
        <form onSubmit={submit} className="learn-auth-form">
          <label>
            <span>New password</span>
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit">Reset Password</button>
        </form>
        {message && (
          <p>
            {message} <Link to={loginPath}>Login</Link>
          </p>
        )}
      </section>
    </main>
  );
};

export default PortalForgotPassword;
