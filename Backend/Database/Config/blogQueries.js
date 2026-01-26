// import { pool } from "./config.db.js";

import pool from "./config.db.js";

/* =========================
   BLOG TABLE SCHEMA
========================= */
export const blogTableSchema = `
CREATE TABLE IF NOT EXISTS blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  key_highlights TEXT[],
  author VARCHAR(100) DEFAULT 'Bright Coders Team',
  image_url TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  last_pushed_at TIMESTAMP WITH TIME ZONE,
  last_withdrawn_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

/* =========================
   Normalize Blog Data
========================= */
const normalizeBlogData = (data) => ({
  title: data.title,
  category: data.category || "General",
  summary: data.summary,
  content: data.content,
  keyHighlights: Array.isArray(data.keyHighlights) ? data.keyHighlights : [],
  author: data.author || "Bright Coders Team",
  imageUrl: data.imageUrl || "https://via.placeholder.com/400x200",
  isPublic: Boolean(data.isPublic),
});

/* =========================
   CREATE BLOG
========================= */
export const createBlog = async (data) => {
  const blog = normalizeBlogData(data);

  const result = await pool.query(
    `INSERT INTO blogs (
      title, category, summary, content,
      key_highlights, author, image_url, is_public
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      blog.title,
      blog.category,
      blog.summary,
      blog.content,
      blog.keyHighlights,
      blog.author,
      blog.imageUrl,
      blog.isPublic,
    ]
  );

  return result.rows[0];
};

/* =========================
   READ ALL BLOGS (ADMIN)
========================= */
export const getAllBlogs = async () => {
  const result = await pool.query(
    `SELECT * FROM blogs ORDER BY created_at DESC`
  );
  return result.rows;
};

/* =========================
   UPDATE BLOG
========================= */
export const updateBlogById = async (id, data) => {
  const blog = normalizeBlogData(data);

  const result = await pool.query(
    `UPDATE blogs
     SET title = $1,
         category = $2,
         summary = $3,
         content = $4,
         key_highlights = $5,
         author = $6,
         image_url = $7
     WHERE id = $8
     RETURNING *`,
    [
      blog.title,
      blog.category,
      blog.summary,
      blog.content,
      blog.keyHighlights,
      blog.author,
      blog.imageUrl,
      id,
    ]
  );

  return result.rows[0];
};

/* =========================
   DELETE BLOG
========================= */
export const deleteBlogById = async (id) => {
  const result = await pool.query(
    `DELETE FROM blogs WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0];
};

/* =========================
   PUSH BLOG LIVE
========================= */
export const pushBlogToLiveDb = async (id) => {
  const result = await pool.query(
    `UPDATE blogs
     SET is_public = true,
         last_pushed_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

/* =========================
   WITHDRAW BLOG
========================= */
export const withdrawBlogFromLiveWeb = async (id) => {
  const result = await pool.query(
    `UPDATE blogs
     SET is_public = false,
         last_withdrawn_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

/* =========================
   READ LIVE BLOGS (PUBLIC)
========================= */
export const getLiveBlogs = async () => {
  const result = await pool.query(
    `SELECT * FROM blogs
     WHERE is_public = true
     ORDER BY last_pushed_at DESC`
  );
  return result.rows;
};
