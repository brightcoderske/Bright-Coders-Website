import express from "express";
import rateLimit from "express-rate-limit";
import { protectLearner } from "../Middleware/learnerAuthMiddleware.js";
import {
  leaderboard,
  learnerCourse,
  learnerDashboard,
  learnerLesson,
  learnerLogin,
  learnerLogout,
  learnerMe,
  saveCode,
  submitLesson,
} from "../Controller/learnerController.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Please try later." },
});

router.post("/auth/login", loginLimiter, learnerLogin);
router.post("/auth/logout", learnerLogout);
router.get("/auth/me", protectLearner, learnerMe);

router.get("/dashboard", protectLearner, learnerDashboard);
router.get("/courses/:slug", protectLearner, learnerCourse);
router.get("/lessons/:id", protectLearner, learnerLesson);
router.patch("/lessons/:id/code", protectLearner, saveCode);
router.post("/lessons/:id/submit", protectLearner, submitLesson);

router.get("/leaderboard/:slug", leaderboard);

export default router;
