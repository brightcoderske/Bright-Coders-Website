  import express from "express";
  import { protect } from "../Middleware/authMiddleware.js";
  import {
    handleAddCourse,
    handleDeleteCourse,
    handleGetCourses,
    handlePushToLive,
    handleUpdateCourse,
    withdrawCourse,
  } from "../Controller/courseController.js";
  import { getLiveCourses } from "../Database/Config/courseQueries.js";
  import { validate } from "../Middleware/validate.js";
  import { courseSchema } from "../Middleware/Validators/courseValidator.js";

  const router = express.Router();
  // Apply 'protect' to ensure only logged-in admins can do these tasks
  router.get("/", handleGetCourses);
  router.post("/", protect, validate(courseSchema), handleAddCourse);
  router.put("/:id", protect, handleUpdateCourse);
  router.delete("/:id", protect, handleDeleteCourse);
  router.post("/:id/push", handlePushToLive);
  router.get("/live", async (req, res) => {
    try {
      const courses = await getLiveCourses();
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching website content" });
    }
  });

  router.post("/:id/withdraw", withdrawCourse);

  export default router;
