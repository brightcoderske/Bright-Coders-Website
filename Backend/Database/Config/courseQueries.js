import pool from "./config.db.js";

/* =========================
   Helper: Normalize Course Input
========================= */
const normalizeCourseData = (data) => ({
  code: data.code,
  title: data.title,
  category: data.category,
  duration: data.duration ?? null,
  price: data.price ?? null,
  focus: Array.isArray(data.focus) ? data.focus : [],
  level: data.level ?? null,
  imageUrl: data.imageUrl ?? null,
  description: data.description ?? {},
  requirements: Array.isArray(data.requirements) ? data.requirements : [],
  isPublic: Boolean(data.isPublic),
  isFeatured: Boolean(data.isFeatured),
});

/* =========================
   TABLE SCHEMA
========================= */
export const courseTableSchema = `
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  duration VARCHAR(50),
  price VARCHAR(50),
  focus TEXT[],
  level VARCHAR(50),
  image_url TEXT,
  description JSONB,
  requirements TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  last_pushed_at TIMESTAMP WITH TIME ZONE,
  last_withdrawn_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

/* =========================
   CREATE COURSE
========================= */
export const createCourse = async (data) => {
  const c = normalizeCourseData(data);

  const result = await pool.query(
    `
    INSERT INTO courses (
      code, title, category, duration, price, focus, level,
      image_url, description, requirements, is_public, is_featured
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *
    `,
    [
      c.code,
      c.title,
      c.category,
      c.duration,
      c.price,
      c.focus,
      c.level,
      c.imageUrl,
      c.description, // pg supports JSONB objects directly
      c.requirements,
      c.isPublic,
      c.isFeatured,
    ],
  );

  return result.rows[0];
};

/* =========================
   READ ALL COURSES (ADMIN)
========================= */
export const getAllCourses = async () => {
  const result = await pool.query(
    `SELECT * FROM courses ORDER BY created_at DESC`,
  );
  return result.rows;
};

/* =========================
   READ COURSE TITLES
========================= */
export const getCourseTitles = async () => {
  const result = await pool.query(`SELECT title FROM courses`);
  return result.rows.map((row) => row.title);
};

/* =========================
   UPDATE COURSE
========================= */
export const updateCourseById = async (id, data) => {
  const c = normalizeCourseData(data);

  const result = await pool.query(
    `
    UPDATE courses SET
      code = $1,
      title = $2,
      category = $3,
      duration = $4,
      price = $5,
      focus = $6,
      level = $7,
      image_url = $8,
      description = $9,
      requirements = $10,
      is_public = $11,
      is_featured = $12
    WHERE id = $13
    RETURNING *
    `,
    [
      c.code,
      c.title,
      c.category,
      c.duration,
      c.price,
      c.focus,
      c.level,
      c.imageUrl,
      c.description,
      c.requirements,
      c.isPublic,
      c.isFeatured,
      id,
    ],
  );

  return result.rows[0];
};

/* =========================
   DELETE COURSE
========================= */
export const deleteCourseById = async (id) => {
  const result = await pool.query(
    `DELETE FROM courses WHERE id = $1 RETURNING id`,
    [id],
  );
  return result.rows[0];
};

/* =========================
   PUBLISH / WITHDRAW COURSE
========================= */
export const pushCourseToLiveDb = async (id) => {
  const result = await pool.query(
    `
    UPDATE courses
    SET is_public = true,
        last_pushed_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `,
    [id],
  );
  return result.rows[0];
};

export const withdrawCourseFromLiveWeb = async (id) => {
  const result = await pool.query(
    `
    UPDATE courses
    SET is_public = false,
        last_withdrawn_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `,
    [id],
  );
  return result.rows[0];
};

/* =========================
   READ LIVE COURSES (PUBLIC)
========================= */
export const getLiveCourses = async () => {
  const result = await pool.query(
    `
    SELECT * FROM courses
    WHERE is_public = true
    ORDER BY is_featured DESC, created_at DESC
    `,
  );
  return result.rows;
};

/* =========================
   TOGGLE FEATURED STATUS
========================= */
export const toggleFeaturedStatus = async (id, isFeatured) => {
  const result = await pool.query(
    `
    UPDATE courses
    SET is_featured = $1
    WHERE id = $2
    RETURNING *
    `,
    [Boolean(isFeatured), id],
  );
  return result.rows[0];
};
