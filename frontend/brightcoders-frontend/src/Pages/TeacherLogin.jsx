import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck } from "lucide-react";
import teacherApi from "../Utils/teacherApi";
import "../Css/TeacherPortal.css";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await teacherApi.post("/teachers/auth/login", { email: email.trim(), password });
      navigate("/teacher/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Teacher Login | Bright Coders</title>
      </Helmet>
      <main className="teacher-auth-page">
        <form className="teacher-auth-card" onSubmit={submit}>
          <ShieldCheck size={38} />
          <h1>Teacher Portal</h1>
          <p>Login after verifying your teacher email.</p>
          <label>
            <span><Mail size={16} /> Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <p className="teacher-error">{error}</p>}
          <button disabled={loading}>{loading ? "Checking..." : "Login"}</button>
          <Link to="/teacher/forgot-password">Forgot password?</Link>
        </form>
      </main>
    </>
  );
};

export default TeacherLogin;
