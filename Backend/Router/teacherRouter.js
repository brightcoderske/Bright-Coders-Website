import express from "express";
import csrf from "csurf";
import rateLimit from "express-rate-limit";
import { protect } from "../Middleware/authMiddleware.js";
import { protectTeacher } from "../Middleware/teacherAuthMiddleware.js";
import {
  adminAutoAllocate,
  adminCreateTeacher,
  adminDeleteTeacher,
  adminSendTeacherReset,
  adminTeacherOverview,
  adminVerifyTeacher,
  teacherComment,
  teacherDashboard,
  teacherLogin,
  teacherLogout,
  teacherMe,
  requestTeacherPasswordReset,
  confirmTeacherPasswordReset,
  verifyTeacherEmail,
} from "../Controller/teacherController.js";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Please try later." },
});

router.get("/verify/:token", verifyTeacherEmail);
router.post("/auth/login", loginLimiter, teacherLogin);
router.post("/auth/logout", teacherLogout);
router.post("/auth/forgot-password", requestTeacherPasswordReset);
router.post("/auth/reset-password/:token", confirmTeacherPasswordReset);
router.get("/auth/me", protectTeacher, teacherMe);
router.get("/dashboard", protectTeacher, teacherDashboard);
router.patch("/work/:progressId/comment", protectTeacher, teacherComment);

router.get("/admin/overview", protect, csrfProtection, adminTeacherOverview);
router.post("/admin", protect, csrfProtection, adminCreateTeacher);
router.post("/admin/auto-allocate", protect, csrfProtection, adminAutoAllocate);
router.post("/admin/:id/reset", protect, csrfProtection, adminSendTeacherReset);
router.patch("/admin/:id/verify", protect, csrfProtection, adminVerifyTeacher);
router.delete("/admin/:id", protect, csrfProtection, adminDeleteTeacher);

export default router;
