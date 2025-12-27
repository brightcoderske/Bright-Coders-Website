import React, { useEffect, useState, useMemo } from "react";
import {
  CustomAlerts,
  Toast,
} from "../../helpers/CustomAlerts/CustomAlerts.jsx";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  FileText,
  EyeOff,
  Globe,
  Search,
  LayoutGrid,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import AddBlogForm from "./AddBlogForm/AddBlogForm.jsx";
import "../AdminBlogManager/AdminBlogManager.css";

const AdminBlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // New Filter Mode: 'total', 'live', or 'draft'
  const [filterMode, setFilterMode] = useState("total");

  const [isPushingId, setIsPushingId] = useState(null);
  const [isWithdrawingId, setIsWithdrawingId] = useState(null);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "danger",
    onConfirm: () => {},
  });

  const [toastConfig, setToastConfig] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const triggerToast = (message, type = "success") => {
    setToastConfig({ show: true, message, type });
    setTimeout(
      () => setToastConfig((prev) => ({ ...prev, show: false })),
      4000
    );
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.BLOGS.GET_ALL);
      setBlogs(response.data);
    } catch (err) {
      triggerToast("Error fetching blogs", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- STATS ---
  const stats = useMemo(() => {
    const live = blogs.filter((b) => b.is_public).length;
    return {
      live,
      draft: blogs.length - live,
      total: blogs.length,
    };
  }, [blogs]);

  // --- UPDATED FILTERING & SORTING ---
  const filteredBlogs = useMemo(() => {
    let result = blogs.filter((blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterMode === "live") {
      return [...result].sort((a, b) => b.is_public - a.is_public);
    } else if (filterMode === "draft") {
      return [...result].sort((a, b) => a.is_public - b.is_public);
    }

    return result; // 'total' mode returns default order
  }, [blogs, searchTerm, filterMode]);

  const handleAddNew = () => {
    setEditingBlog(null);
    setIsModalOpen(true);
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setAlertConfig({
      isOpen: true,
      title: "Delete Blog Post?",
      message: "Are you sure you want to delete this story?",
      type: "danger",
      onConfirm: async () => {
        setAlertConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          await axiosInstance.delete(API_PATHS.BLOGS.DELETE(id));
          setBlogs((prev) => prev.filter((b) => b.id !== id));
          triggerToast("Blog deleted successfully!", "success");
        } catch (err) {
          triggerToast("Failed to delete", "error");
        }
      },
    });
  };

  const handleToggleStatus = (blog) => {
    const isPublic = blog.is_public;
    setAlertConfig({
      isOpen: true,
      title: isPublic ? "Withdraw?" : "Publish?",
      message: `Change visibility for "${blog.title}"?`,
      type: isPublic ? "danger" : "info",
      onConfirm: async () => {
        setAlertConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          if (isPublic) setIsWithdrawingId(blog.id);
          else setIsPushingId(blog.id);
          const path = isPublic
            ? API_PATHS.BLOGS.WITHDRAW(blog.id)
            : API_PATHS.BLOGS.PUSH(blog.id);
          await axiosInstance.post(path);
          triggerToast(isPublic ? "Withdrawn" : "Published", "success");
          fetchBlogs();
        } catch (error) {
          triggerToast("Action failed.", "error");
        } finally {
          setIsPushingId(null);
          setIsWithdrawingId(null);
        }
      },
    });
  };

  return (
    <>
      <div className="admin-container">
        {/* STATS GRID WITH 3 ACTIVE STATES */}
        <div className="stats-grid">
          <div
            className={`stat-card ${
              filterMode === "total" ? "active-filter" : ""
            }`}
            onClick={() => setFilterMode("total")}
          >
            <div className="stat-icon total">
              <LayoutGrid size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Posts</span>
              <span className="stat-value">{stats.total}</span>
            </div>
          </div>

          <div
            className={`stat-card ${
              filterMode === "live" ? "active-filter" : ""
            }`}
            onClick={() => setFilterMode("live")}
          >
            <div className="stat-icon live">
              <Globe size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Live Blogs</span>
              <span className="stat-value">{stats.live}</span>
            </div>
          </div>

          <div
            className={`stat-card ${
              filterMode === "draft" ? "active-filter" : ""
            }`}
            onClick={() => setFilterMode("draft")}
          >
            <div className="stat-icon draft">
              <EyeOff size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Drafts</span>
              <span className="stat-value">{stats.draft}</span>
            </div>
          </div>
        </div>

        <div className="admin-header">
          <div>
            <h1>Blog Management</h1>
            <p className="subtitle">Manage your articles and stories</p>
          </div>
          <div className="header-actions">
            <div className="search-container">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="add-course-btn" onClick={handleAddNew}>
              <Plus size={18} /> Add New Blog
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-full-state">
            <Loader2 className="spinner" size={40} />
            <p>Loading your stories...</p>
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="category-section">
            <div className="category-header">
              <FileText size={20} className="category-icon" />
              <h2 style={{ textTransform: "capitalize" }}>
                {filterMode} Articles
              </h2>
              <span className="item-count">{filteredBlogs.length} Results</span>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="image-head">Image</th>
                    <th className="course-title-head">Blog Title</th>
                    <th className="status-head">Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlogs.map((blog) => (
                    <tr key={blog.id}>
                      <td>
                        <div className="course-img-container">
                          <img
                            src={blog.image_url || "/placeholder-blog.png"}
                            alt={blog.title}
                          />
                        </div>
                      </td>
                      <td>
                        <span className="course-title-text">{blog.title}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            blog.is_public ? "public" : "draft"
                          }`}
                        >
                          {blog.is_public ? "Live" : "Draft"}
                        </span>
                      </td>
                      <td>
                        <span className="sync-time">
                          {new Date(blog.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          {blog.is_public ? (
                            <button
                              className="withdraw-btn"
                              onClick={() => handleToggleStatus(blog)}
                              disabled={isWithdrawingId === blog.id}
                            >
                              {isWithdrawingId === blog.id ? (
                                <Loader2 size={16} className="spinner" />
                              ) : (
                                <EyeOff size={16} />
                              )}
                            </button>
                          ) : (
                            <button
                              className="push-row-btn"
                              onClick={() => handleToggleStatus(blog)}
                              disabled={isPushingId === blog.id}
                            >
                              {isPushingId === blog.id ? (
                                <Loader2 size={16} className="spinner" />
                              ) : (
                                <Globe size={16} />
                              )}
                            </button>
                          )}
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(blog)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(blog.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="empty-state-card">
            <p>No blogs found.</p>
          </div>
        )}
      </div>

      {/* MODALS & TOASTS */}
      <CustomAlerts
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        onCancel={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {toastConfig.show && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig((prev) => ({ ...prev, show: false }))}
        />
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingBlog ? "Edit Blog" : "Add New Blog"}</h2>
              <button className="close-x" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            <AddBlogForm
              onClose={() => setIsModalOpen(false)}
              refreshBlogs={fetchBlogs}
              initialData={editingBlog}
              triggerToast={triggerToast}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AdminBlogManager;
