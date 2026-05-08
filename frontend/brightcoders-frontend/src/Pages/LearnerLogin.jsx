import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Lock, Mail, Sparkles } from "lucide-react";
import learnerApi from "../Utils/learnerApi";
import "../Css/LearnerPortal.css";

const LearnerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await learnerApi.post("/learn/auth/login", { email: email.trim(), password });
      navigate("/learn/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Learner Login | Bright Coders Academy</title>
      </Helmet>
      <main className="learn-auth-page">
        <section className="learn-auth-panel">
          <div className="learn-auth-brand">
            <Sparkles size={34} />
            <span>Bright Coders Learn</span>
          </div>
          <h1>Continue Learning</h1>
          <p>Use the login details sent after enrollment.</p>

          <form onSubmit={handleSubmit} className="learn-auth-form">
            <label>
              <span><Mail size={16} /> Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              <span><Lock size={16} /> Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {error && <p className="learn-error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Checking..." : "Login"}
            </button>
          </form>
          <Link to="/learn/forgot-password">Forgot password?</Link>
        </section>
      </main>
    </>
  );
};

export default LearnerLogin;
