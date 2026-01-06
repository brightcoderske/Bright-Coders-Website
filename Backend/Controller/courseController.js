import * as Queries from "../Database/Config/courseQueries.js";
import { courseSchema } from "../Middleware/Validators/courseValidator.js";

// ========================================
// 🔹 Create Course
// ========================================
export const handleAddCourse = async (request, response) => {
  try {
    const { error, value } = courseSchema.validate(request.body, {
      abortEarly: false,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return response.status(400).json({
        message: "Validation Failed",
        errors: errorMessages,
      });
    }

    // 'value' now includes isFeatured from your validator
    const course = await Queries.createCourse(value);
    return response.status(201).json(course);
  } catch (err) {
    console.error("Add Course Error:", err);
    response.status(500).json({ error: "Server Error" });
  }
};

// ========================================
// 🔹 Get All Courses (Admin View)
// ========================================
export const handleGetCourses = async (request, response) => {
  try {
    const courses = await Queries.getAllCourses();
    return response.status(200).json(courses);
  } catch (err) {
    response.status(500).json({ error: "Failed to fetch courses" });
  }
};

// ========================================
// 🔹 Update Course
// ========================================
export const handleUpdateCourse = async (request, response) => {
  try {
    // request.body should now contain isFeatured
    const updated = await Queries.updateCourseById(
      request.params.id,
      request.body
    );

    if (!updated) {
      return response.status(404).json({ message: "Course not found" });
    }

    return response.status(200).json(updated);
  } catch (err) {
    console.error("Update Error:", err);
    response.status(500).json({ error: "Update Failed!" });
  }
};

// ========================================
// 🔹 Toggle Featured Status (New & Suggested)
// ========================================
// This allows you to "Star" a course from the management table easily
export const handleToggleFeatured = async (request, response) => {
  try {
    const { id } = request.params;
    const { isFeatured } = request.body; // Boolean sent from frontend

    const updated = await Queries.toggleFeaturedStatus(id, isFeatured);

    return response.status(200).json({
      message: `Course ${isFeatured ? "Featured" : "Unfeatured"} successfully`,
      course: updated,
    });
  } catch (err) {
    response.status(500).json({ error: "Failed to update featured status" });
  }
};

// ========================================
// 🔹 Delete Course
// ========================================
export const handleDeleteCourse = async (request, response) => {
  try {
    const deleted = await Queries.deleteCourseById(request.params.id);
    if (!deleted) {
      return response.status(404).json({ message: "Course not found" });
    }
    return response
      .status(200)
      .json({ message: "Course deleted successfully" });
  } catch (err) {
    response.status(500).json({ error: "Delete Failed" });
  }
};

// ========================================
// 🔹 Pushing Course Live
// ========================================
export const handlePushToLive = async (request, response) => {
  try {
    const { id } = request.params;
    const updatedCourse = await Queries.pushCourseToLiveDb(id);
    if (!updatedCourse) {
      return response.status(404).json({ message: "Course not found!" });
    }

    return response.status(200).json({
      message: "Sync Successful! Course is now live.",
      updatedCourse,
    });
  } catch (error) {
    response.status(500).json({ error: "Push to live failed" });
  }
};

// ========================================
// 🔹 Withdraw Course from Live
// ========================================
export const withdrawCourse = async (request, response) => {
  const { id } = request.params;
  try {
    const updatedCourse = await Queries.withdrawCourseFromLiveWeb(id);
    if (!updatedCourse) {
      return response.status(404).json({ message: "Course not found!" });
    }
    return response.status(200).json({
      message: "Course withdrawn from live site",
      updatedCourse,
    });
  } catch (error) {
    console.error("Withdraw Error:", error);
    response.status(500).json({ message: "Server error during withdrawal" });
  }
};

// ========================================
// 🔹 Get Live Courses (Public View - Sorted by Featured)
// ========================================
export const handleGetLiveCourses = async (request, response) => {
  try {
    // This uses the query we updated earlier with "ORDER BY is_featured DESC"
    const courses = await Queries.getLiveCourses();
    return response.status(200).json(courses);
  } catch (err) {
    response.status(500).json({ error: "Failed to fetch live courses" });
  }
};
