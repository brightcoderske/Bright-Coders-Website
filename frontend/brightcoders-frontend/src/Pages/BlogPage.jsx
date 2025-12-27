import React, { useEffect, useState } from "react";
import "../Css/BlogData.css";
import axios from "axios";
import { Loader2, X, Calendar, User, CheckCircle2, Tag } from "lucide-react";

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    const fetchPublicBlogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8000/api/blogs/live"
        );

        const rawData = response.data.data || response.data;
        
        const publicOnly = rawData.filter(
          (blog) => blog.is_public === true || blog.is_public === 1
        );

        setBlogs(publicOnly);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicBlogs();
  }, []);

  return (
    <div className="blog-container">
      <div className="blog-hero">
        <h1>Bright Coders Blog</h1>
        <p>
          Tips, insights, and stories about coding and tech for kids & teens.
        </p>
      </div>

      {loading ? (
        <div
          className="loading-state"
          style={{ textAlign: "center", padding: "50px" }}
        >
          <Loader2 className="spinner" size={40} style={{ margin: "0 auto" }} />
          <p>Loading stories...</p>
        </div>
      ) : (
        <div className="blog-grid">
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <div className="blog-card" key={blog.id}>
                <div className="card-image-wrapper">
                  <img
                    src={blog.image_url || "/placeholder-blog.png"}
                    alt={blog.title}
                  />
                  <span className="category-badge">{blog.category}</span>
                </div>

                <div className="blog-content">
                  <h3>{blog.title}</h3>
                  {/* DISPLAY SUMMARY FIRST */}
                  <p className="blog-summary-text">
                    {blog.summary || "No description available."}
                  </p>

                  <div className="blog-meta">
                    <span>
                      <User size={14} /> {blog.author}
                    </span>
                    <span>
                      <Calendar size={14} />{" "}
                      {new Date(blog.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    className="read-more"
                    onClick={() => setSelectedBlog(blog)}
                  >
                    Read Full Story
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-blogs">
              <p>No stories published yet. Check back soon!</p>
            </div>
          )}
        </div>
      )}

      {/* --- READ MORE MODAL --- */}
      {selectedBlog && (
        <div
          className="blog-modal-overlay"
          onClick={() => setSelectedBlog(null)}
        >
          <div
            className="blog-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal"
              onClick={() => setSelectedBlog(null)}
            >
              <X size={24} />
            </button>

            <img
              src={selectedBlog.image_url || "/placeholder-blog.png"}
              alt={selectedBlog.title}
              className="modal-image"
            />

            <div className="modal-body">
              <div className="modal-header-info">
                <span className="modal-category">
                  <Tag size={14} /> {selectedBlog.category}
                </span>
                <h2>{selectedBlog.title}</h2>
                <div className="modal-meta">
                  <span >
                    <User size={14} /> By <span className="author">{selectedBlog.author}</span>
                  </span>
                  <span>
                    <Calendar size={14} />{" "}
                    {new Date(selectedBlog.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <hr />

              <div className="modal-main-section">
                {/* DISPLAY FULL CONTENT */}
                <div className="full-content">
                  <h4>Article</h4>
                  <p>{selectedBlog.content}</p>
                </div>

                {/* DISPLAY KEY HIGHLIGHTS / REQUIREMENTS */}
                {selectedBlog.key_highlights &&
                  selectedBlog.key_highlights.length > 0 && (
                    <div className="highlights-section">
                      <h4>Key Highlights & Requirements</h4>
                      <ul className="highlights-list">
                        {selectedBlog.key_highlights.map((item, index) => (
                          <li key={index}>
                            <CheckCircle2 size={16} className="check-icon" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
