import jwt from "jsonwebtoken";
import { findTeacherById } from "../Database/Config/lmsQueries.js";

export const teacherCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 1000 * 60 * 60 * 8,
};

export const protectTeacher = async (req, res, next) => {
  try {
    const token = req.cookies?.teacher_token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "teacher") {
      return res.status(401).json({ message: "Invalid teacher session" });
    }

    const teacher = await findTeacherById(decoded.id);
    if (!teacher || !teacher.is_active || !teacher.email_verified) {
      return res.status(401).json({ message: "Teacher account unavailable" });
    }

    req.teacher = teacher;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
};
