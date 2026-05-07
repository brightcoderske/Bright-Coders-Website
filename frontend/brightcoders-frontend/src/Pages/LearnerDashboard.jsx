import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Award, BookOpen, Flame, LogOut, Trophy } from "lucide-react";
import learnerApi from "../Utils/learnerApi";
import { getGradeBand } from "../Utils/grading";
import "../Css/LearnerPortal.css";

const LearnerDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardRes, leaderboardRes] = await Promise.all([
          learnerApi.get("/learn/dashboard"),
          learnerApi.get("/learn/leaderboard/web-development"),
        ]);
        setData(dashboardRes.data);
        setLeaderboard(leaderboardRes.data);
      } catch (error) {
        navigate("/learn/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const completedCount = data?.progress?.filter((item) => item.status === "completed").length || 0;
  const averageScore = useMemo(() => {
    if (!data?.progress?.length) return 0;
    const completed = data.progress.filter((item) => item.status === "completed");
    if (!completed.length) return 0;
    return Math.round(
      completed.reduce((sum, item) => sum + Number(item.total_score || 0), 0) /
        completed.length,
    );
  }, [data]);

  const logout = async () => {
    await learnerApi.post("/learn/auth/logout");
    navigate("/learn/login");
  };

  if (loading) {
    return <div className="learn-loading">Loading learner dashboard...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Learner Dashboard | Bright Coders</title>
      </Helmet>
      <main className="learn-dashboard">
        <header className="learn-dashboard-header">
          <div>
            <span>Welcome back</span>
            <h1>{data.learner.display_name}</h1>
          </div>
          <button onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </header>

        <section className="learn-stats">
          <article>
            <Trophy />
            <strong>{data.learner.points}</strong>
            <span>Points</span>
          </article>
          <article>
            <BookOpen />
            <strong>{completedCount}</strong>
            <span>Lessons Done</span>
          </article>
          <article>
            <Award />
            <strong>{averageScore}%</strong>
            <span>Average Score</span>
          </article>
          <article>
            <Flame />
            <strong>{data.learner.streak_count}</strong>
            <span>Streak</span>
          </article>
        </section>

        <section className="learn-main-grid">
          <div className="learn-course-list">
            <h2>Your Courses</h2>
            {data.courses.map((course) => (
              <Link
                className="learn-course-card"
                key={course.id}
                to={`/learn/course/${course.slug}`}
              >
                <span>{course.title}</span>
                <p>{course.description}</p>
              </Link>
            ))}
          </div>

          <div className="learn-leaderboard">
            <h2>Leaderboard</h2>
            {leaderboard.slice(0, 8).map((row) => (
              <div className="leaderboard-row" key={`${row.rank}-${row.display_name}`}>
                <span>#{row.rank}</span>
                <strong>{row.display_name}</strong>
                <em>{row.total_points} pts</em>
              </div>
            ))}
          </div>
        </section>

        <section className="learn-recent-work">
          <h2>Recent Work</h2>
          {data.progress.length ? (
            data.progress.slice(0, 6).map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.lesson_title}</strong>
                  <span>{item.module_title}</span>
                </div>
                <b>{item.total_score}% · {getGradeBand(item.total_score)}</b>
              </article>
            ))
          ) : (
            <p>No lessons completed yet. Start with Web Development.</p>
          )}
        </section>
      </main>
    </>
  );
};

export default LearnerDashboard;
