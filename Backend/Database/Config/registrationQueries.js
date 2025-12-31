import { sql } from "./config.db.js";

/* =========================
    REGISTRATION TABLE SCHEMA
========================= */
export const registrationTableSchema = `
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    parent_name VARCHAR(255) NOT NULL,
    parent_phone VARCHAR(50) NOT NULL,
    parent_email VARCHAR(255) NOT NULL,
    child_name VARCHAR(255) NOT NULL,
    age_group VARCHAR(50) NOT NULL,
    grade_group VARCHAR(50) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    preferred_time VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    internet_quality VARCHAR(50) NOT NULL,
    emergency_contact VARCHAR(255) NOT NULL,
    emergency_phone VARCHAR(50) NOT NULL,
    notes TEXT,
    heard_from VARCHAR(100),
    consent BOOLEAN DEFAULT FALSE,
    payment_status VARCHAR(20) DEFAULT 'pending', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

/* =========================
    CREATE REGISTRATION (Wizard Form)
========================= */
export const createRegistration = async (data) => {
  const values = [
    data.parentName,
    data.parentPhone,
    data.parentEmail,
    data.childName,
    data.ageGroup,
    data.gradeGroup,
    data.gender,
    data.course,
    data.preferredTime,
    data.deviceType,
    data.internetQuality,
    data.emergencyContact,
    data.emergencyPhone,
    data.notes || null,
    data.heardFrom,
    data.consent || false,
  ];

  const result = await sql.query(
    `INSERT INTO registrations (
        parent_name, parent_phone, parent_email, 
        child_name, age_group, grade_group, gender, 
        course_name, preferred_time, 
        device_type, internet_quality, 
        emergency_contact, emergency_phone, 
        notes, heard_from, consent
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
    values
  );

  return result[0];
};

/* =========================
    READ ALL (ADMIN DASHBOARD)
========================= */
export const getAllRegistrations = async () => {
  return await sql`
    SELECT * FROM registrations
    ORDER BY created_at DESC
  `;
};

/* =========================
    UPDATE PAYMENT STATUS
========================= */
export const updatePaymentStatus = async (id, status) => {
  const result = await sql.query(
    `UPDATE registrations
     SET payment_status = $1
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );
  return result[0];
};

/* =========================
    DELETE REGISTRATION
========================= */
export const deleteRegistrationById = async (id) => {
  const result = await sql.query(
    `DELETE FROM registrations WHERE id = $1 RETURNING id`,
    [id]
  );
  return result[0];
};
