import express from "express";
import csrf from "csurf";
import { protect } from "../Middleware/authMiddleware.js";
import {
  getAdminCourseTree,
  getLmsOverview,
  updateLessonContent,
} from "../Controller/lmsAdminController.js";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.get("/overview", protect, csrfProtection, getLmsOverview);
router.get("/courses", protect, csrfProtection, getAdminCourseTree);
router.patch("/lessons/:id", protect, csrfProtection, updateLessonContent);

export default router;
