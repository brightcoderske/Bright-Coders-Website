import crypto from "crypto";
import jwt from "jsonwebtoken";
import * as Lms from "../Database/Config/lmsQueries.js";
import { sendTeacherWelcomeEmail } from "../Utils/mailer.js";
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

    const { password_hash, verification_token, ...safeTeacher } = teacher;
    return res.status(200).json({ teacher: safeTeacher });
  } catch (error) {
    return res.status(500).json({ message: "Login failed." });
  }
};

export const teacherLogout = async (req, res) => {
  res.clearCookie("teacher_token", teacherCookieOptions);
  return res.status(200).json({ message: "Logged out." });
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

export const adminAutoAllocate = async (req, res) => {
  const result = await Lms.autoAllocateLearnersToTeachers(
    req.body.courseSlug || "web-development",
  );
  return res.status(200).json(result);
};
