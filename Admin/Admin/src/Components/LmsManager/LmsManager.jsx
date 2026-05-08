import React, { useEffect, useState } from "react";
import { BookOpenCheck, Mail, Save, ShieldCheck, Trash2, TrendingDown, Trophy, Users } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { getGradeBand } from "../../utils/grading";
import "../AdminBlogManager/AdminBlogManager.css";
import "./LmsManager.css";

const LmsManager = () => {
  const [overview, setOverview] = useState({ learners: [], lessons: [], leaderboard: [] });
  const [contentRows, setContentRows] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacherData, setTeacherData] = useState({ teachers: [], classes: [] });
  const [teacherForm, setTeacherForm] = useState({ fullName: "", email: "", phone: "" });
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [overviewRes, contentRes] = await Promise.all([
        axiosInstance.get(API_PATHS.LMS.OVERVIEW),
        axiosInstance.get(API_PATHS.LMS.COURSES),
      ]);
      setOverview(overviewRes.data);
      setContentRows(contentRes.data);
      setSelectedCourseId((current) => current || String(contentRes.data.find((row) => row.course_id)?.course_id || ""));
      const teacherRes = await axiosInstance.get(API_PATHS.TEACHERS.OVERVIEW);
      setTeacherData(teacherRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openLesson = async (row) => {
    setSelectedLesson(row);
    setLessonForm({
      title: row.lesson_title,
      notes: row.notes || "",
      taskPrompt: row.task_prompt || "",
      exampleHtml: row.example_html || "",
      exampleCss: row.example_css || "",
      exampleJs: row.example_js || "",
      tasksText: JSON.stringify(row.tasks || [], null, 2),
      minStudySeconds: row.min_study_seconds || 90,
      unlockAt: row.unlock_at ? new Date(row.unlock_at).toISOString().slice(0, 16) : "",
      isLocked: Boolean(row.is_locked),
      isPublished: row.is_published,
    });
  };

  const saveLesson = async () => {
    if (!selectedLesson) return;
    setSaving(true);
    try {
      let tasks = [];
      try {
        tasks = JSON.parse(lessonForm.tasksText || "[]");
      } catch {
        alert("Tasks must be valid JSON before saving.");
        setSaving(false);
        return;
      }
      await axiosInstance.patch(
        API_PATHS.LMS.UPDATE_LESSON(selectedLesson.lesson_id),
        {
          title: lessonForm.title,
          notes: lessonForm.notes,
          taskPrompt: lessonForm.taskPrompt,
          exampleHtml: lessonForm.exampleHtml,
          exampleCss: lessonForm.exampleCss,
          exampleJs: lessonForm.exampleJs,
          tasks,
          minStudySeconds: Number(lessonForm.minStudySeconds) || 60,
          unlockAt: lessonForm.unlockAt || null,
          isLocked: Boolean(lessonForm.isLocked),
          isPublished: Boolean(lessonForm.isPublished),
        },
      );
      await load();
      setSelectedLesson(null);
      setLessonForm({});
    } finally {
      setSaving(false);
    }
  };

  const createTeacher = async (event) => {
    event.preventDefault();
    await axiosInstance.post(API_PATHS.TEACHERS.CREATE, teacherForm);
    setTeacherForm({ fullName: "", email: "", phone: "" });
    await load();
  };

  const autoAllocate = async () => {
    const selectedCourse = contentRows.find(
      (row) => String(row.course_id) === String(selectedCourseId),
    );
    await axiosInstance.post(API_PATHS.TEACHERS.AUTO_ALLOCATE, {
      courseSlug: selectedCourse?.slug || "web-development",
    });
    await load();
  };

  const sendTeacherReset = async (teacherId) => {
    await axiosInstance.post(API_PATHS.TEACHERS.RESET(teacherId));
    await load();
  };

  const verifyTeacher = async (teacherId) => {
    await axiosInstance.patch(API_PATHS.TEACHERS.VERIFY(teacherId));
    await load();
  };

  const deleteTeacher = async (teacherId) => {
    if (!window.confirm("Delete this teacher account? Their classes will remain but become unassigned.")) return;
    await axiosInstance.delete(API_PATHS.TEACHERS.DELETE(teacherId));
    await load();
  };

  const inactiveLearners = overview.learners.filter((learner) => !learner.last_activity_at).length;
  const difficultLessons = overview.lessons.slice(0, 5);
  const courses = Array.from(
    new Map(contentRows.filter((row) => row.course_id).map((row) => [row.course_id, row])).values(),
  );
  const visibleContentRows = contentRows.filter(
    (row) => !selectedCourseId || String(row.course_id) === String(selectedCourseId),
  );

  return (
    <div className="admin-container lms-admin">
      <div className="admin-header">
        <div>
          <h1>Learning System</h1>
          <p className="subtitle">Choose a course, manage learners, teachers, content, locks, and lesson timing.</p>
        </div>
      </div>

      <section className="lms-panel lms-course-picker">
        <label>
          Course
          <select
            className="admin-input"
            value={selectedCourseId}
            onChange={(event) => setSelectedCourseId(event.target.value)}
          >
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_title}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total"><Users size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Learners</span>
            <span className="stat-value">{overview.learners.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon live"><Trophy size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Leaderboard</span>
            <span className="stat-value">{overview.leaderboard.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon draft"><TrendingDown size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Inactive</span>
            <span className="stat-value">{inactiveLearners}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total"><BookOpenCheck size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Lessons</span>
            <span className="stat-value">
              {contentRows.filter((row) => row.lesson_id).length}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-full-state">Loading LMS...</div>
      ) : (
        <div className="lms-grid">
          <section className="lms-panel">
            <h2>Learners</h2>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Points</th>
                    <th>Lessons</th>
                    <th>Average</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.learners.map((learner) => (
                    <tr key={learner.id}>
                      <td>{learner.display_name}</td>
                      <td>{learner.points}</td>
                      <td>{learner.completed_lessons}</td>
                      <td>{learner.average_score}% · {getGradeBand(learner.average_score)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="lms-panel">
            <h2>Difficult Lessons</h2>
            {difficultLessons.map((lesson) => (
              <div className="difficulty-row" key={lesson.id}>
                <div>
                  <strong>{lesson.title}</strong>
                  <span>{lesson.module_title}</span>
                </div>
                <b>{lesson.average_score}%</b>
              </div>
            ))}
          </section>

          <section className="lms-panel lms-content-panel">
            <h2>Course Content</h2>
            {visibleContentRows
              .filter((row) => row.lesson_id)
              .map((row) => (
                <button
                  key={row.lesson_id}
                  className="content-row"
                  onClick={() => openLesson(row)}
                >
                  <span>{row.module_title}</span>
                  <strong>{row.lesson_title}</strong>
                  <em>
                    {row.is_locked
                      ? "Locked"
                      : row.unlock_at
                        ? `Opens ${new Date(row.unlock_at).toLocaleDateString()}`
                        : row.is_published
                          ? "Published"
                          : "Hidden"}
                  </em>
                </button>
              ))}
          </section>
        </div>
      )}

      <div className="lms-grid" style={{ marginTop: "20px" }}>
        <section className="lms-panel">
          <h2>Register Teacher</h2>
          <form onSubmit={createTeacher} className="teacher-form">
            <input
              placeholder="Full name"
              value={teacherForm.fullName}
              onChange={(event) =>
                setTeacherForm((prev) => ({ ...prev, fullName: event.target.value }))
              }
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={teacherForm.email}
              onChange={(event) =>
                setTeacherForm((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
            <input
              placeholder="Phone"
              value={teacherForm.phone}
              onChange={(event) =>
                setTeacherForm((prev) => ({ ...prev, phone: event.target.value }))
              }
            />
            <button className="confirm-btn" type="submit">Create & Email Teacher</button>
          </form>
        </section>

        <section className="lms-panel">
          <h2>Class Allocation</h2>
          <button className="confirm-btn" onClick={autoAllocate}>
            Auto-allocate selected course learners
          </button>
          <div className="class-list">
            {teacherData.classes.map((item) => (
              <div className="difficulty-row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.teacher_name || "No teacher"} · {item.course_title}</span>
                </div>
                <b>{item.learner_count}/15</b>
              </div>
            ))}
          </div>
        </section>

        <section className="lms-panel lms-content-panel">
          <h2>Teachers</h2>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Verified</th>
                  <th>Classes</th>
                  <th>Learners</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teacherData.teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>{teacher.full_name}</td>
                    <td>{teacher.email}</td>
                    <td>{teacher.email_verified ? "Yes" : "Pending"}</td>
                    <td>{teacher.classes_count}</td>
                    <td>{teacher.learners_count}</td>
                    <td>
                      <div className="teacher-actions">
                        {!teacher.email_verified && (
                          <button title="Mark verified" onClick={() => verifyTeacher(teacher.id)}>
                            <ShieldCheck size={14} />
                          </button>
                        )}
                        <button title="Send reset link" onClick={() => sendTeacherReset(teacher.id)}>
                          <Mail size={14} />
                        </button>
                        <button title="Delete teacher" onClick={() => deleteTeacher(teacher.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selectedLesson && (
        <div className="modal-overlay1">
          <div className="modal-content1 lms-edit-modal">
            <div className="modal-header1">
              <h3>Edit Lesson</h3>
              <button onClick={() => setSelectedLesson(null)} className="close-btn">
                &times;
              </button>
            </div>
            <div className="modal-body1">
              <label>
                Lesson Title
                <input
                  className="admin-input"
                  value={lessonForm.title || ""}
                  onChange={(event) =>
                    setLessonForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </label>
              <label>
                Lesson Notes
                <textarea
                  className="admin-input lms-long-field"
                  value={lessonForm.notes || ""}
                  onChange={(event) =>
                    setLessonForm((prev) => ({ ...prev, notes: event.target.value }))
                  }
                />
              </label>
              <label>
                Task Prompt
                <textarea
                  className="admin-input"
                  value={lessonForm.taskPrompt || ""}
                  onChange={(event) =>
                    setLessonForm((prev) => ({ ...prev, taskPrompt: event.target.value }))
                  }
                />
              </label>
              <div className="lms-editor-grid">
                <label>
                  Example HTML
                  <textarea
                    className="admin-input"
                    value={lessonForm.exampleHtml || ""}
                    onChange={(event) =>
                      setLessonForm((prev) => ({ ...prev, exampleHtml: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Example CSS
                  <textarea
                    className="admin-input"
                    value={lessonForm.exampleCss || ""}
                    onChange={(event) =>
                      setLessonForm((prev) => ({ ...prev, exampleCss: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Example JS
                  <textarea
                    className="admin-input"
                    value={lessonForm.exampleJs || ""}
                    onChange={(event) =>
                      setLessonForm((prev) => ({ ...prev, exampleJs: event.target.value }))
                    }
                  />
                </label>
              </div>
              <label>
                Lesson Tasks JSON
                <textarea
                  className="admin-input lms-long-field lms-code-field"
                  value={lessonForm.tasksText || ""}
                  onChange={(event) =>
                    setLessonForm((prev) => ({ ...prev, tasksText: event.target.value }))
                  }
                />
              </label>
              <div className="lms-editor-grid">
                <label>
                  Study Time (seconds)
                  <input
                    className="admin-input"
                    type="number"
                    min="30"
                    value={lessonForm.minStudySeconds || 60}
                    onChange={(event) =>
                      setLessonForm((prev) => ({
                        ...prev,
                        minStudySeconds: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Opens At
                  <input
                    className="admin-input"
                    type="datetime-local"
                    value={lessonForm.unlockAt || ""}
                    onChange={(event) =>
                      setLessonForm((prev) => ({ ...prev, unlockAt: event.target.value }))
                    }
                  />
                </label>
              </div>
              <label className="publish-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(lessonForm.isLocked)}
                  onChange={(event) =>
                    setLessonForm((prev) => ({
                      ...prev,
                      isLocked: event.target.checked,
                    }))
                  }
                />
                Locked
              </label>
              <label className="publish-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(lessonForm.isPublished)}
                  onChange={(event) =>
                    setLessonForm((prev) => ({
                      ...prev,
                      isPublished: event.target.checked,
                    }))
                  }
                />
                Published
              </label>
              <button className="confirm-btn" onClick={saveLesson} disabled={saving}>
                <Save size={16} /> {saving ? "Saving..." : "Save Lesson"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LmsManager;
