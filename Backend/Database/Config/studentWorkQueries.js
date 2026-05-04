import { query } from "./config.db.js";

export const studentWorkTableSchema = `
CREATE TABLE IF NOT EXISTS student_work (
  id SERIAL PRIMARY KEY,
  student_name VARCHAR(120) NOT NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN ('scratch', 'web', 'ai', 'graphics')),
  title VARCHAR(180) NOT NULL,
  project_url TEXT,
  image_url TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const normalizeProject = (data) => ({
  studentName: String(data.studentName || "").trim(),
  category: String(data.category || "").trim().toLowerCase(),
  title: String(data.title || "").trim(),
  projectUrl: data.projectUrl?.trim() || null,
  imageUrl: data.imageUrl?.trim() || null,
  description: data.description?.trim() || null,
  isPublic: Boolean(data.isPublic),
});

export const createStudentWork = async (data) => {
  const project = normalizeProject(data);
  const rows = await query(
    `
    INSERT INTO student_work (
      student_name, category, title, project_url, image_url, description, is_public
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *
    `,
    [
      project.studentName,
      project.category,
      project.title,
      project.projectUrl,
      project.imageUrl,
      project.description,
      project.isPublic,
    ],
  );

  return rows[0];
};

export const getAllStudentWork = async () => {
  return await query(`SELECT * FROM student_work ORDER BY created_at DESC`);
};

export const getPublicStudentWork = async () => {
  return await query(
    `
    SELECT *
    FROM student_work
    WHERE is_public = true
    ORDER BY created_at DESC
    `,
  );
};

export const updateStudentWork = async (id, data) => {
  const project = normalizeProject(data);
  const rows = await query(
    `
    UPDATE student_work
    SET student_name = $1,
        category = $2,
        title = $3,
        project_url = $4,
        image_url = $5,
        description = $6,
        is_public = $7,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *
    `,
    [
      project.studentName,
      project.category,
      project.title,
      project.projectUrl,
      project.imageUrl,
      project.description,
      project.isPublic,
      id,
    ],
  );

  return rows[0];
};

export const deleteStudentWork = async (id) => {
  const rows = await query(`DELETE FROM student_work WHERE id = $1 RETURNING id`, [
    id,
  ]);
  return rows[0];
};
