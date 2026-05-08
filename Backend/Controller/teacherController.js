import crypto from "crypto";
import jwt from "jsonwebtoken";
import * as Lms from "../Database/Config/lmsQueries.js";
import { sendTeacherWelcomeEmail } from "../Utils/mailer.js";
import { sendPortalResetEmail } from "../Utils/mailer.js";
import {
  teacherCookieOptions,
} from "../Middleware/teacherAuthMiddleware.js";

const generatePassword = () => {
  return `TCH-${crypto.randomBytes(3).toString("hex").toUpperCase()}-${crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase()}`;
};

const generateTeacherToken = (id) => {
  return jwt.sign({ id, role: "teacher" }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
};

const sanitizeTeacher = (teacher = {}) => {
  const {
    password_hash,
    verification_token,
    verification_expires,
    reset_token,
    reset_expires,
    ...safeTeacher
  } = teacher;
  return safeTeacher;
};

export const adminCreateTeacher = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    const existing = await Lms.findTeacherByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Teacher email already exists." });
    }

    const plainPassword = generatePassword();
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const teacher = await Lms.createTeacherAccount({
      fullName,
      email,
      phone,
      plainPassword,
      verificationToken,
      verificationExpires,
    });

    const verificationUrl = `${
      process.env.API_PUBLIC_URL || process.env.API_URL || ""
    }/api/teachers/verify/${verificationToken}`;

    try {
      await sendTeacherWelcomeEmail({
        teacher,
        plainPassword,
        verificationUrl,
      });
    } catch (emailError) {
      console.error("TEACHER_WELCOME_EMAIL_ERROR:", emailError.message);
    }

    return res.status(201).json(teacher);
  } catch (error) {
    console.error("ADMIN_CREATE_TEACHER_ERROR:", error);
    return res.status(500).json({ message: "Failed to create teacher." });
  }
};

export const verifyTeacherEmail = async (req, res) => {
  const teacher = await Lms.verifyTeacherEmailToken(req.params.token);
  if (!teacher) {
    return res.status(400).send("Verification link is invalid or expired.");
  }
  return res.send("Teacher email verified. You can now login.");
};

export const teacherLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }

    const teacher = await Lms.findTeacherByEmail(email);
    if (!teacher || !teacher.is_active) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (!teacher.email_verified) {
      return res.status(403).json({ message: "Please verify your email first." });
    }

    const ok = await Lms.compareTeacherPassword(password, teacher.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    await Lms.updateTeacherLastLogin(teacher.id);
    res.cookie("teacher_token", generateTeacherToken(teacher.id), teacherCookieOptions);

    return res.status(200).json({ teacher: sanitizeTeacher(teacher) });
  } catch (error) {
    return res.status(500).json({ message: "Login failed." });
  }
};

export const teacherLogout = async (req, res) => {
  res.clearCookie("teacher_token", teacherCookieOptions);
  return res.status(200).json({ message: "Logged out." });
};

export const requestTeacherPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (email) {
    const token = crypto.randomBytes(32).toString("hex");
    const teacher = await Lms.setTeacherResetToken(
      email,
      token,
      new Date(Date.now() + 1000 * 60 * 30),
    );
    if (teacher) {
      const siteUrl = process.env.SITE_URL || process.env.FRONTEND_URL || req.get("origin") || "";
      const resetUrl = `${siteUrl}/teacher/reset-password/${token}`;
      await sendPortalResetEmail({
        to: teacher.email,
        name: teacher.full_name,
        resetUrl,
        portalName: "Teacher Portal",
      }).catch((error) => console.error("TEACHER_RESET_EMAIL:", error.message));
    }
  }
  return res.status(200).json({ message: "If the account exists, a reset link has been sent." });
};

export const confirmTeacherPasswordReset = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password || password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }
  const teacher = await Lms.resetTeacherPassword(token, password);
  if (!teacher) return res.status(400).json({ message: "Invalid or expired reset link." });
  return res.status(200).json({ message: "Password reset successfully." });
};

export const teacherMe = async (req, res) => {
  return res.status(200).json({ teacher: req.teacher });
};

export const teacherDashboard = async (req, res) => {
  const dashboard = await Lms.getTeacherDashboard(req.teacher.id);
  return res.status(200).json({ teacher: req.teacher, ...dashboard });
};

export const teacherComment = async (req, res) => {
  const saved = await Lms.saveTeacherComment({
    teacherId: req.teacher.id,
    progressId: req.params.progressId,
    comment: req.body.comment || "",
  });

  if (!saved) return res.status(404).json({ message: "Work not found." });
  return res.status(200).json(saved);
};

export const adminTeacherOverview = async (req, res) => {
  const [teachers, classes] = await Promise.all([
    Lms.getAllTeachers(),
    Lms.getClasses(),
  ]);
  return res.status(200).json({ teachers, classes });
};

export const adminSendTeacherReset = async (req, res) => {
  try {
    const teacher = await Lms.findTeacherById(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found." });

    const token = crypto.randomBytes(32).toString("hex");
    await Lms.setTeacherResetToken(
      teacher.email,
      token,
      new Date(Date.now() + 1000 * 60 * 30),
    );

    const siteUrl = process.env.SITE_URL || process.env.FRONTEND_URL || req.get("origin") || "";
    await sendPortalResetEmail({
      to: teacher.email,
      name: teacher.full_name,
      resetUrl: `${siteUrl}/teacher/reset-password/${token}`,
      portalName: "Teacher Portal",
    });

    return res.status(200).json({ message: "Teacher reset link sent." });
  } catch (error) {
    console.error("ADMIN_TEACHER_RESET_ERROR:", error);
    return res.status(500).json({ message: "Failed to send reset link." });
  }
};

export const adminVerifyTeacher = async (req, res) => {
  try {
    const teacher = await Lms.verifyTeacherAccount(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found." });
    return res.status(200).json(teacher);
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify teacher." });
  }
};

export const adminDeleteTeacher = async (req, res) => {
  try {
    const teacher = await Lms.deleteTeacherAccount(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found." });
    return res.status(200).json({ message: "Teacher deleted.", teacher });
  } catch (error) {
    console.error("ADMIN_DELETE_TEACHER_ERROR:", error);
    return res.status(500).json({ message: "Failed to delete teacher." });
  }
};

export const adminAutoAllocate = async (req, res) => {
  const result = await Lms.autoAllocateLearnersToTeachers(
    req.body.courseSlug || "web-development",
  );
  return res.status(200).json(result);
};
