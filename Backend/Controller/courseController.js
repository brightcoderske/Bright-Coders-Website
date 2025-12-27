import { response } from "express";
import * as Queries from "../Database/Config/courseQueries.js";
import { courseSchema } from "../Middleware/Validators/courseValidator.js";
// ========================================
// 🔹 Create Course
// ========================================
export const handleAddCourse = async (request, response) => {
  try {
    // validate() returns an object with an 'error' property if it fails
    const { error, value } = courseSchema.validate(request.body, { abortEarly: false });

    if (error) {
      // Map the errors into a clean array of messages
      const errorMessages = error.details.map((detail) => detail.message);
      return response.status(400).json({ 
        message: "Validation Failed", 
        errors: errorMessages 
      });
    }

    // 'value' is the cleaned, validated data (it even converts types!)
    const course = await Queries.createCourse(value);
    return response.status(201).json(course);
    
  } catch (err) {
    response.status(500).json({ error: "Server Error" });
  }
};

// ========================================
// 🔹 Get Course
// ========================================

export const handleGetCourses = async (request, response) => {
  try {
    const courses = await Queries.getAllCourses();
    return response.status(200).json(courses);
  } catch (err) {
    response.status(500).json({
      error: "Failed to fetch courses",
    });
  }
};
// ========================================
// 🔹 Update Course
// ========================================
export const handleUpdateCourse = async (request, response) => {
  try {
    const updated = await Queries.updateCourseById(
      request.params.id,
      request.body
    );
    return response.status(200).json(updated);
  } catch (err) {
    response.status(500).json({ error: "Update Failed!" });
  }
};
// ========================================
// 🔹 Delete Course
// ========================================
export const handleDeleteCourse = async (request, response) => {
  try {
    const deleted = await Queries.deleteCourseById(request.params.id);
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
    // Call the database function to handle the push
    const updatedCourse = await Queries.pushCourseToLiveDb(id);
    if (!updatedCourse) {
      return response.status(404).json({ message: "Course not found!" });
    }

    return response
      .status(200)
      .json({ message: "Sync Successful! Course is now live.", updatedCourse });
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
