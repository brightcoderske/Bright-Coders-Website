import React, { useState, useRef } from "react";
import { X, UploadCloud, Image as ImageIcon, Loader2, Tag } from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance.js";
import { API_PATHS } from "../../../utils/apiPaths.js";
import "./AddBlogForm.css";

const AddBlogForm = ({ onClose, refreshBlogs, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    category: initialData?.category || "", // Added Category
    summary: initialData?.summary || "",
    author: initialData?.author || "Bright Coders Team",
    imageUrl: initialData?.image_url || "",
    content: initialData?.content || "",
    keyHighlights: initialData?.key_highlights?.join(", ") || "",
  });

  const LIMITS = {
    TITLE: 70,
    SUMMARY: 150,
    CONTENT: 5000,
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("image", file);

    try {
      setUploading(true);
      const res = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      alert("Image uploaded successfully!");
    } catch (error) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submissionData = {
      ...formData,
      keyHighlights: formData.keyHighlights
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i),
    };

    try {
      if (initialData) {
        await axiosInstance.put(
          API_PATHS.BLOGS.UPDATE(initialData.id),
          submissionData
        );
      } else {
        await axiosInstance.post(API_PATHS.BLOGS.CREATE, submissionData);
      }
      alert("Blog saved successfully!");
      refreshBlogs();
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.errors?.[0] || "Error saving blog";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content blog-modal">
        <div className="modal-header-styled">
          <div>
            <h3>{initialData ? "Edit Blog Post" : "Create New Post"}</h3>
            <p>Fill in the details below to publish your story.</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={26} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-section">
            <div className="form-group">
              <label>Blog Title</label>
              <input
                name="title"
                placeholder="e.g., The Future of Coding for Kids"
                value={formData.title}
                onChange={handleChange}
                maxLength={LIMITS.TITLE}
                required
              />
            </div>

            {/* NEW CATEGORY INPUT */}
            <div className="form-group">
              <label>Category</label>
              <input
                name="category"
                type="text"
                placeholder="e.g., Robotics, AI, Coding..."
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>Short Summary</label>
                <span
                  className={`char-count ${
                    formData.summary.length >= LIMITS.SUMMARY
                      ? "limit-reached"
                      : ""
                  }`}
                >
                  {formData.summary.length}/{LIMITS.SUMMARY}
                </span>
              </div>
              <textarea
                name="summary"
                placeholder="A brief catchphrase for the blog card..."
                value={formData.summary}
                onChange={handleChange}
                rows="2"
                maxLength={LIMITS.SUMMARY}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Cover Media</label>
              <div
                className={`image-upload-card ${
                  formData.imageUrl ? "has-image" : ""
                }`}
                onClick={() => fileInputRef.current.click()}
              >
                {uploading ? (
                  <div className="upload-loader">
                    <Loader2 className="spinner" />
                  </div>
                ) : formData.imageUrl ? (
                  <>
                    <img src={formData.imageUrl} alt="Preview" />
                    <div className="change-overlay">
                      <ImageIcon size={16} /> Change Image
                    </div>
                  </>
                ) : (
                  <div className="upload-prompt">
                    <UploadCloud size={32} />
                    <span>Click to upload thumbnail</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  hidden
                  accept="image/*"
                />
              </div>
            </div>

            <div className="form-column">
              <div className="form-group">
                <label>Author</label>
                <input
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Manual Image URL</label>
                <input
                  name="imageUrl"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>
              Key Highlights <small>(Separated by commas)</small>
            </label>
            <input
              name="keyHighlights"
              placeholder="Fun, Educational, Free..."
              value={formData.keyHighlights}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Full Blog Content</label>
            <span className="char-count">
              {formData.content.length.toLocaleString()}/{LIMITS.CONTENT}
            </span>
            <textarea
              name="content"
              className="content-area"
              placeholder="Start writing..."
              value={formData.content}
              onChange={handleChange}
              maxLength={LIMITS.CONTENT}
              rows="8"
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="btn-save"
            >
              {loading ? (
                <>
                  <Loader2 className="spinner" size={18} /> Saving...
                </>
              ) : (
                "Save & Publish"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlogForm;
