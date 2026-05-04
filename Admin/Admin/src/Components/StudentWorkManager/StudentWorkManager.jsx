import React, { useEffect, useMemo, useState } from "react";
import { Edit2, ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import uploadImage from "../../utils/uploadImage";
import "../AdminBlogManager/AdminBlogManager.css";
import "./StudentWorkManager.css";

const emptyForm = {
  studentName: "",
  category: "scratch",
  title: "",
  projectUrl: "",
  imageUrl: "",
  description: "",
  isPublic: true,
};

const categories = [
  { value: "scratch", label: "Scratch" },
  { value: "web", label: "Web Development" },
  { value: "ai", label: "AI" },
  { value: "graphics", label: "Graphics Design" },
];

const StudentWorkManager = () => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const categoryCounts = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.value] = projects.filter(
        (project) => project.category === category.value,
      ).length;
      return acc;
    }, {});
  }, [projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.STUDENT_WORK.GET_ALL);
      setProjects(response.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setForm({
      studentName: project.student_name,
      category: project.category,
      title: project.title,
      projectUrl: project.project_url || "",
      imageUrl: project.image_url || "",
      description: project.description || "",
      isPublic: project.is_public,
    });
    setImageFile(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const upload = await uploadImage(imageFile);
        imageUrl = upload.imageUrl || upload.url;
      }

      const payload = { ...form, imageUrl };
      if (editingId) {
        await axiosInstance.put(API_PATHS.STUDENT_WORK.UPDATE(editingId), payload);
      } else {
        await axiosInstance.post(API_PATHS.STUDENT_WORK.CREATE, payload);
      }

      resetForm();
      await fetchProjects();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student project?")) return;
    await axiosInstance.delete(API_PATHS.STUDENT_WORK.DELETE(id));
    setProjects((prev) => prev.filter((project) => project.id !== id));
  };

  return (
    <div className="admin-container student-work-admin">
      <div className="admin-header">
        <div>
          <h1>Student Work</h1>
          <p className="subtitle">Publish selected projects to the public website.</p>
        </div>
      </div>

      <div className="student-work-layout">
        <form className="student-work-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit Project" : "Add Project"}</h2>

          <input
            name="studentName"
            placeholder="Student first name"
            value={form.studentName}
            onChange={handleChange}
            required
          />
          <input
            name="title"
            placeholder="Project title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <select name="category" value={form.category} onChange={handleChange}>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          {form.category === "graphics" ? (
            <>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              />
              <input
                name="imageUrl"
                placeholder="Image URL, if already uploaded"
                value={form.imageUrl}
                onChange={handleChange}
              />
            </>
          ) : (
            <input
              name="projectUrl"
              placeholder="Project link"
              value={form.projectUrl}
              onChange={handleChange}
              required
            />
          )}

          <textarea
            name="description"
            placeholder="Short note about the project"
            value={form.description}
            onChange={handleChange}
          />

          <label className="publish-toggle">
            <input
              type="checkbox"
              name="isPublic"
              checked={form.isPublic}
              onChange={handleChange}
            />
            Show on public website
          </label>

          <div className="student-work-actions">
            <button type="submit" className="confirm-btn" disabled={saving}>
              {saving ? <Loader2 className="spinner" size={16} /> : <Plus size={16} />}
              {editingId ? "Save Changes" : "Add Project"}
            </button>
            {editingId && (
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="student-work-list">
          <div className="student-work-counts">
            {categories.map((category) => (
              <span key={category.value}>
                {category.label}: <strong>{categoryCounts[category.value] || 0}</strong>
              </span>
            ))}
          </div>

          {loading ? (
            <div className="loading-full-state">
              <Loader2 className="spinner" size={36} />
              <p>Loading projects...</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Project</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.student_name}</td>
                      <td>{project.title}</td>
                      <td>{project.category}</td>
                      <td>
                        <span className={`badge ${project.is_public ? "public" : "draft"}`}>
                          {project.is_public ? "public" : "draft"}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          {(project.project_url || project.image_url) && (
                            <a
                              className="push-row-btn"
                              href={project.project_url || project.image_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                          <button className="edit-btn" onClick={() => handleEdit(project)}>
                            <Edit2 size={16} />
                          </button>
                          <button className="delete-btn" onClick={() => handleDelete(project.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentWorkManager;
