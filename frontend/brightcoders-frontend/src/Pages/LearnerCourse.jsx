import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import learnerApi from "../Utils/learnerApi";
import "../Css/LearnerPortal.css";

const LearnerCourse = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await learnerApi.get(`/learn/courses/${slug}`);
        setCourse(res.data);
      } catch (error) {
        navigate("/learn/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, navigate]);

  if (loading) return <div className="learn-loading">Loading course...</div>;

  return (
    <>
      <Helmet>
        <title>{course.title} | Bright Coders Learn</title>
      </Helmet>
      <main className="learn-course-page">
        <header className="learn-course-hero">
          <Link to="/learn/dashboard">Back to dashboard</Link>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
        </header>

        <div className="module-stack">
          {course.modules.map((module) => (
            <section className="module-panel" key={module.id}>
              <div className="module-title-row">
                <div>
                  <span>Module {module.module_order}</span>
                  <h2>{module.title}</h2>
                  <p>{module.summary}</p>
                </div>
              </div>

              <div className="lesson-list">
                {module.lessons.map((lesson) => (
                  <Link
                    className="lesson-row"
                    key={lesson.id}
                    to={`/learn/lesson/${lesson.id}`}
                  >
                    {lesson.status === "completed" ? (
                      <CheckCircle2 className="done-icon" />
                    ) : lesson.total_score ? (
                      <PlayCircle />
                    ) : (
                      <Lock />
                    )}
                    <div>
                      <strong>{lesson.title}</strong>
                      <span>
                        {lesson.status === "completed"
                          ? `Completed: ${lesson.total_score}%`
                          : "Open lesson"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
};

export default LearnerCourse;
