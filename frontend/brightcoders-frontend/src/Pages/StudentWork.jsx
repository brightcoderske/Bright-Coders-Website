import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { loadCachedList } from "../Utils/cachedApi";
import "../Css/StudentWork.css";
import { SITE_URL } from "../Utils/seoData";

const categories = [
  { key: "scratch", label: "Scratch" },
  { key: "web", label: "Web Development" },
  { key: "ai", label: "AI" },
  { key: "graphics", label: "Graphics Design" },
];

const StudentWork = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const rowRefs = useRef({});
  const siteUrl = SITE_URL;
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        await loadCachedList({
          cacheKey: "brightcoders:student-work",
          url: `${apiUrl}/student-work/live`,
          onData: setProjects,
        });
      } catch (error) {
        console.error("Failed to fetch student work:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [apiUrl]);

  const groupedProjects = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.key] = projects.filter(
        (project) => project.category === category.key,
      );
      return acc;
    }, {});
  }, [projects]);

  const scrollRow = (category, direction) => {
    const row = rowRefs.current[category];
    if (!row) return;
    row.scrollBy({
      left: direction * Math.min(row.clientWidth, 720),
      behavior: "smooth",
    });
  };

  return (
    <>
      <Helmet>
        <title>Student Work | Bright Coders Academy</title>
        <meta
          name="description"
          content="Explore Bright Coders student projects in Scratch, web development, AI, and graphics design."
        />
        <link rel="canonical" href={`${siteUrl}/student-work`} />
      </Helmet>

      <main className="student-work-page">
        <section className="student-work-hero">
          <div>
            <span>Bright Coders Academy</span>
            <h1>Student Work</h1>
            <p>Published projects from our young builders.</p>
          </div>
        </section>

        {loading ? (
          <div className="student-work-loading">
            <div className="simple-spinner"></div>
            <p>Loading projects...</p>
          </div>
        ) : (
          <div className="student-work-sections">
            {categories.map((category) => {
              const items = groupedProjects[category.key] || [];
              if (!items.length) return null;

              return (
                <section className="student-work-category" key={category.key}>
                  <div className="category-heading">
                    <h2>{category.label}</h2>
                    {items.length > 3 && (
                      <div className="category-scroll-actions">
                        <button onClick={() => scrollRow(category.key, -1)}>
                          <ChevronLeft size={18} />
                        </button>
                        <button onClick={() => scrollRow(category.key, 1)}>
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    className="student-work-row"
                    ref={(node) => {
                      rowRefs.current[category.key] = node;
                    }}
                  >
                    {items.map((project) => (
                      <article className="student-project-card" key={project.id}>
                        {category.key === "graphics" && project.image_url ? (
                          <img src={project.image_url} alt={project.title} />
                        ) : (
                          <div className="project-link-preview">
                            <ExternalLink size={34} />
                          </div>
                        )}
                        <div className="student-project-body">
                          <span>{project.student_name}</span>
                          <h3>{project.title}</h3>
                          {project.description && <p>{project.description}</p>}
                          {(project.project_url || project.image_url) && (
                            <a
                              href={project.project_url || project.image_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View Project <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}

            {projects.length === 0 && (
              <div className="student-work-empty">
                <p>No student projects have been published yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default StudentWork;
