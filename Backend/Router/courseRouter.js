import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import {
  handleAddCourse,
  handleDeleteCourse,
  handleGetCourses,
  handlePushToLive,
  handleUpdateCourse,
  withdrawCourse,
  handleToggleFeatured, // Import the new toggle handler
  handleGetLiveCourses, // Import the improved live handler
} from "../Controller/courseController.js";
import { validate } from "../Middleware/validate.js";
import {
  courseSchema,
  toggleFeaturedSchema, // Import the smaller schema for toggling
} from "../Middleware/Validators/courseValidator.js";

const router = express.Router();

// --- ADMIN ROUTES (Management) ---
router.get("/", protect, handleGetCourses); // Usually admin only
router.post("/", protect, validate(courseSchema), handleAddCourse);
router.put("/:id", protect, validate(courseSchema), handleUpdateCourse); // Added validation here
router.delete("/:id", protect, handleDeleteCourse);

//  One-click Featured Toggle
router.patch(
  "/:id/featured",
  protect,
  validate(toggleFeaturedSchema),
  handleToggleFeatured
);

// Sync Actions
router.post("/:id/push", protect, handlePushToLive);
router.post("/:id/withdraw", protect, withdrawCourse);

// --- PUBLIC ROUTES (Website) ---
// This route is used by the student-facing homepage
router.get("/live", handleGetLiveCourses);

export default router;
