import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Save, Send } from "lucide-react";
import learnerApi from "../Utils/learnerApi";
import { getGradeBand } from "../Utils/grading";
import "../Css/LearnerPortal.css";

const LearnerLesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await learnerApi.get(`/learn/lessons/${id}`);
        setLesson(res.data);
        setHtml(res.data.html_code || res.data.example_html || "");
        setCss(res.data.css_code || res.data.example_css || "");
        setJs(res.data.js_code || res.data.example_js || "");
      } catch (error) {
        navigate("/learn/login");
      }
    };
    load();
  }, [id, navigate]);

  const preview = useMemo(
    () => `
      <!doctype html>
      <html>
        <head><style>${css}</style></head>
        <body>${html}<script>${js}<\/script></body>
      </html>
    `,
    [html, css, js],
  );

  const saveCode = async () => {
    setSaving(true);
    try {
      await learnerApi.patch(`/learn/lessons/${id}/code`, { html, css, js });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (lesson) saveCode();
    }, 1500);
    return () => clearTimeout(timer);
  }, [html, css, js]);

  const submit = async () => {
    const res = await learnerApi.post(`/learn/lessons/${id}/submit`, {
      html,
      css,
      js,
      answers,
    });
    setResult(res.data);
  };

  if (!lesson) return <div className="learn-loading">Loading lesson...</div>;

  return (
    <>
      <Helmet>
        <title>{lesson.title} | Bright Coders Learn</title>
      </Helmet>
      <main className="lesson-page">
        <header className="lesson-header">
          <Link to={`/learn/course/${lesson.course_slug}`}>Back to course</Link>
          <span>{lesson.module_title}</span>
          <h1>{lesson.title}</h1>
        </header>

        <section className="lesson-grid">
          <aside className="lesson-notes">
            <h2>Lesson Notes</h2>
            <p>{lesson.notes}</p>
            <h3>Task</h3>
            <p>{lesson.task_prompt}</p>

            <div className="quiz-box">
              <h3>Quiz</h3>
              {lesson.questions.map((question) => (
                <label key={question.id} className="quiz-question">
                  <span>{question.question_text}</span>
                  {question.question_type === "fill_blank" ? (
                    <input
                      value={answers[question.id] || ""}
                      onChange={(event) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [question.id]: event.target.value,
                        }))
                      }
                    />
                  ) : (
                    <select
                      value={answers[question.id] || ""}
                      onChange={(event) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [question.id]: event.target.value,
                        }))
                      }
                    >
                      <option value="">Choose answer</option>
                      {(question.options || []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              ))}
            </div>
          </aside>

          <section className="coding-area">
            <div className="editor-tabs">
              <span>HTML</span>
              <span>CSS</span>
              <span>JavaScript</span>
              <button onClick={saveCode}>
                <Save size={14} /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
            <div className="editors">
              <textarea value={html} onChange={(event) => setHtml(event.target.value)} />
              <textarea value={css} onChange={(event) => setCss(event.target.value)} />
              <textarea value={js} onChange={(event) => setJs(event.target.value)} />
            </div>
            <div className="preview-panel">
              <iframe title="Live preview" srcDoc={preview} sandbox="allow-scripts" />
            </div>
            <button className="submit-lesson-btn" onClick={submit}>
              <Send size={16} /> Submit Lesson
            </button>
          </section>
        </section>

        {result && (
          <div className="result-panel">
            <CheckCircle2 size={28} />
            <div>
              <h2>
                Score: {result.progress.total_score}% ·{" "}
                {getGradeBand(result.progress.total_score)}
              </h2>
              <p>
                Quiz {result.progress.quiz_score}% · Code{" "}
                {result.progress.code_score}% · Points{" "}
                {result.progress.points_awarded}
              </p>
              {result.checks?.missing?.length > 0 && (
                <p>
                  Missing:{" "}
                  {result.checks.missing
                    .map((item) => `${item.area} ${item.item}`)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default LearnerLesson;
