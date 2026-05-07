import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { BookOpen, LogOut, MessageSquare, Users } from "lucide-react";
import teacherApi from "../Utils/teacherApi";
import { getGradeBand } from "../Utils/grading";
import "../Css/TeacherPortal.css";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [comments, setComments] = useState({});

  const load = async () => {
    try {
      const res = await teacherApi.get("/teachers/dashboard");
      setData(res.data);
    } catch (error) {
      navigate("/teacher/login");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const logout = async () => {
    await teacherApi.post("/teachers/auth/logout");
    navigate("/teacher/login");
  };

  const saveComment = async (progressId) => {
    await teacherApi.patch(`/teachers/work/${progressId}/comment`, {
      comment: comments[progressId] || "",
    });
    await load();
  };

  if (!data) return <div className="teacher-loading">Loading teacher dashboard...</div>;

  return (
    <>
      <Helmet>
        <title>Teacher Dashboard | Bright Coders</title>
      </Helmet>
      <main className="teacher-dashboard">
        <header className="teacher-header">
          <div>
            <span>Teacher Dashboard</span>
            <h1>{data.teacher.full_name}</h1>
          </div>
          <button onClick={logout}><LogOut size={16} /> Logout</button>
        </header>

        <section className="teacher-stats">
          <article>
            <BookOpen />
            <strong>{data.classes.length}</strong>
            <span>Classes</span>
          </article>
          <article>
            <Users />
            <strong>{data.learners.length}</strong>
            <span>Learners</span>
          </article>
          <article>
            <MessageSquare />
            <strong>{data.work.length}</strong>
            <span>Submissions</span>
          </article>
        </section>

        <section className="teacher-grid">
          <div className="teacher-panel">
            <h2>Classes</h2>
            {data.classes.map((item) => (
              <div className="teacher-row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.course_title}</span>
                </div>
                <b>{item.learner_count}/15</b>
              </div>
            ))}
          </div>

          <div className="teacher-panel">
            <h2>Learners</h2>
            {data.learners.map((learner) => (
              <div className="teacher-row" key={`${learner.class_id}-${learner.learner_id}`}>
                <div>
                  <strong>{learner.display_name}</strong>
                  <span>{learner.class_name}</span>
                </div>
                <b>{learner.average_score}% · {getGradeBand(learner.average_score)}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="teacher-panel submissions-panel">
          <h2>Submitted Work</h2>
          {data.work.map((item) => (
            <article className="submission-card" key={item.id}>
              <div className="submission-head">
                <div>
                  <strong>{item.display_name} · {item.lesson_title}</strong>
                  <span>{item.module_title} · {item.class_name}</span>
                </div>
                <b>{item.total_score}% · {getGradeBand(item.total_score)}</b>
              </div>
              <details>
                <summary>View submitted code</summary>
                <pre>{`HTML\n${item.html_code}\n\nCSS\n${item.css_code}\n\nJavaScript\n${item.js_code}`}</pre>
              </details>
              <div className="comment-box">
                <input
                  placeholder={item.teacher_comment || "Add teacher comment"}
                  value={comments[item.id] || ""}
                  onChange={(event) =>
                    setComments((prev) => ({
                      ...prev,
                      [item.id]: event.target.value,
                    }))
                  }
                />
                <button onClick={() => saveComment(item.id)}>Save Comment</button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
};

export default TeacherDashboard;
