import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import learnerApi from "../Utils/learnerApi";
import { getGradeBand } from "../Utils/grading";
import "../Css/LearnerPortal.css";

const LearnerLesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notesRef = useRef(null);
  const [lesson, setLesson] = useState(null);
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [studySeconds, setStudySeconds] = useState(0);
  const [notesSeen, setNotesSeen] = useState(false);
  const [activeTask, setActiveTask] = useState(0);
  const [unlockedTasks, setUnlockedTasks] = useState(1);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await learnerApi.get(`/learn/lessons/${id}`);
        setLesson(res.data);
        setHtml(res.data.html_code || "");
        setCss(res.data.css_code || "");
        setJs(res.data.js_code || "");
        setAnswers({});
        setResult(null);
        setStudySeconds(0);
        setNotesSeen(false);
        setActiveTask(0);
        setUnlockedTasks(1);
        setSubmitError("");
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

  const examplePreview = useMemo(
    () => `
      <!doctype html>
      <html>
        <head><style>${lesson?.example_css || ""}</style></head>
        <body>${lesson?.example_html || ""}<script>${lesson?.example_js || ""}<\/script></body>
      </html>
    `,
    [lesson],
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

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        setStudySeconds((value) => value + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const node = notesRef.current;
      if (node && node.scrollHeight <= node.clientHeight + 8) setNotesSeen(true);
    }, 250);
    return () => clearTimeout(timer);
  }, [lesson]);

  const tasks = lesson?.tasks || [];
  const activeTaskItem = tasks[activeTask];
  const minStudySeconds = Number(lesson?.min_study_seconds || 0);
  const canAttempt = notesSeen && studySeconds >= minStudySeconds;

  const handleNotesScroll = () => {
    const node = notesRef.current;
    if (!node) return;
    const bottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 24;
    if (bottom) setNotesSeen(true);
  };

  const submit = async () => {
    setSubmitError("");
    try {
      const res = await learnerApi.post(`/learn/lessons/${id}/submit`, {
        html,
        css,
        js,
        answers,
        taskIndex: activeTask,
        studySeconds,
      });
      setResult(res.data);
      if (res.data.task?.passed) {
        setUnlockedTasks((value) => Math.min(value + 1, tasks.length || 1));
        setActiveTask((value) => Math.min(value + 1, (tasks.length || 1) - 1));
      }
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Could not submit this task.");
    }
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
          <div className="lesson-nav-actions">
            {lesson.previousLessonId && (
              <Link to={`/learn/lesson/${lesson.previousLessonId}`}>
                <ChevronLeft size={16} /> Previous lesson
              </Link>
            )}
            {lesson.nextLessonId && (
              <Link to={`/learn/lesson/${lesson.nextLessonId}`}>
                Next lesson <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </header>

        <section className="lesson-grid">
          <aside className="lesson-notes" ref={notesRef} onScroll={handleNotesScroll}>
            <h2>Lesson Notes</h2>
            {String(lesson.notes || "")
              .split(/\n+/)
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={`${paragraph}-${index}`}>{paragraph}</p>
              ))}
            <h3>Example Code</h3>
            <pre className="lesson-code-example">{`HTML
${lesson.example_html}

CSS
${lesson.example_css}

JavaScript
${lesson.example_js || "// No JavaScript needed in this example."}`}</pre>
            <div className="example-preview">
              <iframe title="Lesson example preview" srcDoc={examplePreview} sandbox="allow-scripts" />
            </div>
            <h3>Task</h3>
            <p>{lesson.task_prompt}</p>

            <div className="task-steps">
              {tasks.map((task, index) => (
                <button
                  key={task.title}
                  disabled={index >= unlockedTasks}
                  className={index === activeTask ? "active-task" : ""}
                  onClick={() => setActiveTask(index)}
                >
                  Task {index + 1}: {task.title}
                </button>
              ))}
            </div>
            {activeTaskItem && (
              <p className="active-task-prompt">{activeTaskItem.prompt}</p>
            )}

            <div className="quiz-box">
              <h3>Quiz</h3>
              {!canAttempt && (
                <p className="study-warning">
                  Keep learning: scroll through the notes and spend{" "}
                  {Math.max(minStudySeconds - studySeconds, 0)}s more before submitting.
                </p>
              )}
              {lesson.questions.map((question) => (
                <label key={question.id} className="quiz-question">
                  <span>{question.question_text}</span>
                  {question.question_type === "fill_blank" ? (
                    <input
                      disabled={!canAttempt}
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
                      disabled={!canAttempt}
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
            <div className="workspace-note">
              <strong>Task {activeTask + 1}</strong>
              <span>
                Start with your own idea. The example is for learning, not copying.
              </span>
            </div>
            <div className="editor-tabs">
              <span>Task Workspace: HTML</span>
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
            <button className="submit-lesson-btn" onClick={submit} disabled={!canAttempt}>
              <Send size={16} /> {activeTask >= tasks.length - 1 ? "Submit Lesson" : "Submit Task"}
            </button>
            {submitError && <p className="learn-error">{submitError}</p>}
          </section>
        </section>

        {result && (
          <div className="result-panel">
            <CheckCircle2 size={28} />
            <div>
              {result.progress ? (
                <>
                  <h2>
                    Score: {result.progress.total_score}% ·{" "}
                    {getGradeBand(result.progress.total_score)}
                  </h2>
                  <p>
                    Quiz {result.progress.quiz_score}% · Code{" "}
                    {result.progress.code_score}% · Points{" "}
                    {result.progress.points_awarded}
                  </p>
                </>
              ) : (
                <>
                  <h2>
                    Task {Number(result.task?.index || 0) + 1}:{" "}
                    {result.task?.passed ? "Passed" : "Try again"}
                  </h2>
                  <p>Code score {result.task?.codeScore || 0}%</p>
                </>
              )}
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

        <nav className="lesson-bottom-nav">
          {lesson.previousLessonId ? (
            <Link to={`/learn/lesson/${lesson.previousLessonId}`}>
              <ChevronLeft size={16} /> Previous lesson
            </Link>
          ) : (
            <span />
          )}
          {lesson.nextLessonId && (
            <Link to={`/learn/lesson/${lesson.nextLessonId}`}>
              Next lesson <ChevronRight size={16} />
            </Link>
          )}
        </nav>
      </main>
    </>
  );
};

export default LearnerLesson;
