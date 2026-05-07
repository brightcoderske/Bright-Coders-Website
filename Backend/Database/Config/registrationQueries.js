import { query } from "./config.db.js";

/* =========================
   REGISTRATION TABLE SCHEMA
========================= */
export const registrationTableSchema = `
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  registration_number VARCHAR(20) UNIQUE, 
  parent_name VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(50) NOT NULL,
  parent_email VARCHAR(255) NOT NULL,
  child_email VARCHAR(255),
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
  mpesa_code VARCHAR(50),

  -- Financial
  total_course_price DECIMAL(10,2) DEFAULT 0.00,
  amount_paid DECIMAL(10,2) DEFAULT 0.00,
  balance_due DECIMAL(10,2) DEFAULT 0.00,
  payment_plan VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  last_payment_at TIMESTAMP,
  receipt_status VARCHAR(50) DEFAULT 'pending',
  receipt_url TEXT,

  -- Certificate
  completion_status VARCHAR(50) DEFAULT 'enrolled',
  certificate_url TEXT,
  certificate_issued_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export const registrationUpgradeSchema = `
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS student_key VARCHAR(40);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS student_admission_number VARCHAR(30);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS previous_registration_id INTEGER REFERENCES registrations(id);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS module_sequence INTEGER DEFAULT 1;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS enrollment_status VARCHAR(30) DEFAULT 'active';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS graduated_to_registration_id INTEGER REFERENCES registrations(id);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS graduated_at TIMESTAMP;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS invoice_status VARCHAR(30) DEFAULT 'not_sent';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS invoice_sent_at TIMESTAMP;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS child_email VARCHAR(255);

UPDATE registrations SET student_key = CONCAT('STU-', id) WHERE student_key IS NULL;
UPDATE registrations SET student_admission_number = registration_number WHERE student_admission_number IS NULL;
UPDATE registrations SET module_sequence = 1 WHERE module_sequence IS NULL;
UPDATE registrations SET enrollment_status = COALESCE(enrollment_status, 'active');
`;

/* =========================
   NORMALIZE INPUT
========================= */
const normalizeRegistrationData = (data) => ({
  parentName: data.parentName,
  parentPhone: data.parentPhone,
  parentEmail: data.parentEmail,
  childEmail: data.childEmail ?? data.child_email ?? null,
  childName: data.childName,
  ageGroup: data.ageGroup,
  gradeGroup: data.gradeGroup,
  gender: data.gender,
  course: data.course,
  preferredTime: data.preferredTime,
  deviceType: data.deviceType,
  internetQuality: data.internetQuality,
  emergencyContact: data.emergencyContact,
  emergencyPhone: data.emergencyPhone,
  notes: data.notes ?? null,
  heardFrom: data.heardFrom ?? null,
  consent: Boolean(data.consent),
  mpesaCode: data.mpesaCode ?? "PAY_LATER",
  totalCoursePrice: data.totalCoursePrice ?? 0.0,
  amountPaid: data.amountPaid ?? 0.0,
  balanceDue: data.balanceDue ?? 0.0,
  paymentPlan: data.paymentPlan ?? "full",
  paymentStatus: data.paymentStatus ?? "pending",
});

/* =========================
   CREATE REGISTRATION
========================= */
export const createRegistration = async (data) => {
  const d = normalizeRegistrationData(data);
  const year = new Date().getFullYear().toString().slice(-2);

  /* 1️⃣ Get course code */
  const courseRows = await query(`SELECT code FROM courses WHERE title = $1`, [
    d.course,
  ]);
  const courseCode = courseRows[0]?.code || "GEN";

  /* 2️⃣ Insert registration */
  const insertRows = await query(
    `
    INSERT INTO registrations (
      parent_name, parent_phone, parent_email, child_email, child_name,
      age_group, grade_group, gender, course_name, preferred_time, device_type,
      internet_quality, emergency_contact, emergency_phone, notes,
      heard_from, consent, mpesa_code, total_course_price,
      amount_paid, balance_due, payment_plan, payment_status
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,
      $19,$20,$21,$22,$23
    )
    RETURNING id
    `,
    [
      d.parentName,
      d.parentPhone,
      d.parentEmail,
      d.childEmail,
      d.childName,
      d.ageGroup,
      d.gradeGroup,
      d.gender,
      d.course,
      d.preferredTime,
      d.deviceType,
      d.internetQuality,
      d.emergencyContact,
      d.emergencyPhone,
      d.notes,
      d.heardFrom,
      d.consent,
      d.mpesaCode,
      d.totalCoursePrice,
      d.amountPaid,
      d.balanceDue,
      d.paymentPlan,
      d.paymentStatus,
    ],
  );

  const newId = insertRows[0].id;
  const serial = newId.toString().padStart(3, "0");
  const regNumber = `BC-${year}-${courseCode}-${serial}`;

  /* 3️⃣ Update registration number */
  const finalRows = await query(
    `
    UPDATE registrations
    SET registration_number = $1
    WHERE id = $2
    RETURNING *
    `,
    [regNumber, newId],
  );

  return finalRows[0];
};

/* =========================
   READ REGISTRATIONS
========================= */
export const getAllRegistrations = async () => {
  return await query(`SELECT * FROM registrations ORDER BY created_at DESC`);
};

export const getRegistrationById = async (id) => {
  const rows = await query(`SELECT * FROM registrations WHERE id = $1`, [id]);
  return rows[0];
};

export const getRegistrationsByStudentKey = async (studentKey) => {
  return await query(
    `
    SELECT *
    FROM registrations
    WHERE student_key = $1
    ORDER BY module_sequence ASC, created_at ASC
    `,
    [studentKey],
  );
};

/* =========================
   UPDATE PAYMENT
========================= */
export const updatePaymentStatus = async (
  id,
  status,
  totalPaid,
  balance,
  mpesa,
) => {
  const rows = await query(
    `
    UPDATE registrations
    SET payment_status = $1,
        amount_paid = $2,
        balance_due = $3,
        mpesa_code = $4,
        last_payment_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *
    `,
    [status, totalPaid, balance, mpesa, id],
  );

  return rows[0];
};

/* =========================
   ISSUE CERTIFICATE
========================= */
export const issueCertificate = async (id, certificateUrl) => {
  const rows = await query(
    `
    UPDATE registrations
    SET certificate_url = $1,
        completion_status = 'completed',
        certificate_issued_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
    `,
    [certificateUrl, id],
  );

  return rows[0];
};

export const graduateRegistrationToCourse = async ({
  registrationId,
  nextCourseId,
  preferredTime,
}) => {
  const currentRows = await query(`SELECT * FROM registrations WHERE id = $1`, [
    registrationId,
  ]);
  const current = currentRows[0];
  if (!current) return null;

  const nextCourseRows = await query(`SELECT * FROM courses WHERE id = $1`, [
    nextCourseId,
  ]);
  const nextCourse = nextCourseRows[0];
  if (!nextCourse) {
    const error = new Error("Next course not found");
    error.statusCode = 404;
    throw error;
  }

  const year = new Date().getFullYear().toString().slice(-2);
  const nextSequence = Number(current.module_sequence || 1) + 1;
  const studentKey = current.student_key || `STU-${current.id}`;
  const studentAdmission =
    current.student_admission_number || current.registration_number;
  const price =
    Number(String(nextCourse.price || "0").replace(/[^0-9.-]+/g, "")) || 0;

  const insertRows = await query(
    `
    INSERT INTO registrations (
      parent_name, parent_phone, parent_email, child_email, child_name,
      age_group, grade_group, gender, course_name, preferred_time, device_type,
      internet_quality, emergency_contact, emergency_phone, notes,
      heard_from, consent, mpesa_code, total_course_price,
      amount_paid, balance_due, payment_plan, payment_status,
      student_key, student_admission_number, previous_registration_id,
      module_sequence, enrollment_status, invoice_status
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,
      $19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29
    )
    RETURNING id
    `,
    [
      current.parent_name,
      current.parent_phone,
      current.parent_email,
      current.child_email,
      current.child_name,
      current.age_group,
      current.grade_group,
      current.gender,
      nextCourse.title,
      preferredTime || current.preferred_time,
      current.device_type,
      current.internet_quality,
      current.emergency_contact,
      current.emergency_phone,
      current.notes,
      current.heard_from,
      current.consent,
      "PAY_LATER",
      price,
      0,
      price,
      "pay_later",
      "pending",
      studentKey,
      studentAdmission,
      current.id,
      nextSequence,
      "active",
      "pending",
    ],
  );

  const newId = insertRows[0].id;
  const serial = newId.toString().padStart(3, "0");
  const regNumber = `BC-${year}-${nextCourse.code || "GEN"}-${serial}`;

  const newRows = await query(
    `
    UPDATE registrations
    SET registration_number = $1
    WHERE id = $2
    RETURNING *
    `,
    [regNumber, newId],
  );

  await query(
    `
    UPDATE registrations
    SET enrollment_status = 'completed',
        graduated_to_registration_id = $1,
        graduated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    `,
    [newId, current.id],
  );

  return newRows[0];
};

export const markInvoiceSent = async (id) => {
  const rows = await query(
    `
    UPDATE registrations
    SET invoice_status = 'sent',
        invoice_sent_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `,
    [id],
  );

  return rows[0];
};

/* =========================
   DELETE REGISTRATION
========================= */
export const deleteRegistrationById = async (id) => {
  const rows = await query(
    `DELETE FROM registrations WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows[0];
};

/* =========================
   VERIFY CERTIFICATE
========================= */
export const verifyCertificate = async (regNumber) => {
  const rows = await query(
    `
    SELECT *
    FROM registrations
    WHERE registration_number = $1
      AND payment_status = 'paid'
    `,
    [regNumber],
  );
  return rows[0];
};


/* =========================
   UPDATE RECEIPT URL
========================= */
export const updateReceiptUrl = async (id, receiptUrl) => {
  const rows = await query(
    `
    UPDATE registrations
    SET receipt_url = $1,
        receipt_status = 'generated'
    WHERE id = $2
    RETURNING *
    `,
    [receiptUrl, id]
  );

  return rows[0];
};
