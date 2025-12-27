import { sql } from "./config.db.js";

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
   CREATE BLOG
========================= */
export const createBlog = async (data) => {
  const values = [
    data.title,
    data.category || "General", // Added Category
    data.summary, // Simple explanation
    data.content,
    data.keyHighlights || [], // Array: ["Point 1", "Point 2"]
    data.author || "Bright Coders Team",
    data.imageUrl,
    false,
  ];

  const result = await sql.query(
    `INSERT INTO blogs 
      (title, category, summary, content, key_highlights, author, image_url, is_public)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    values
  );

  return result[0];
};

/* =========================
   READ ALL BLOGS (ADMIN)
========================= */
export const getAllBlogs = async () => {
  return await sql`
    SELECT * FROM blogs
    ORDER BY created_at DESC
  `;
};

/* =========================
   UPDATE BLOG
========================= */
export const updateBlogById = async (id, data) => {
  const values = [
    data.title,
    data.category, // Added Category
    data.summary, // Simple explanation
    data.content,
    data.keyHighlights,
    data.author,
    data.imageUrl,
    id,
  ];

  const result = await sql.query(
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
    values
  );

  return result[0];
};

/* =========================
   DELETE BLOG
========================= */
export const deleteBlogById = async (id) => {
  const result = await sql.query(
    `DELETE FROM blogs WHERE id = $1 RETURNING id`,
    [id]
  );
  return result[0];
};

/* =========================
   PUSH BLOG LIVE
========================= */
export const pushBlogToLiveDb = async (id) => {
  const result = await sql.query(
    `UPDATE blogs
     SET is_public = true,
         last_pushed_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result[0];
};

/* =========================
   WITHDRAW BLOG
========================= */
export const withdrawBlogsFromLiveWeb = async (id) => {
  const result = await sql.query(
    `UPDATE blogs
     SET is_public = false,
         last_withdrawn_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result[0];
};

/* =========================
   READ LIVE BLOGS (PUBLIC)
========================= */
export const getLiveBlogs = async () => {
  // Directly returns the array of public blogs
  return await sql`
    SELECT * FROM blogs
    WHERE is_public = true
    ORDER BY last_pushed_at DESC
  `;
};
