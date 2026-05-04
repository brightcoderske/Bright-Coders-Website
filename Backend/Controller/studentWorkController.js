import * as Queries from "../Database/Config/studentWorkQueries.js";
import { studentWorkSchema } from "../Middleware/Validators/studentWorkValidator.js";

const validateProject = (body) => {
  return studentWorkSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export const handleCreateStudentWork = async (req, res) => {
  try {
    const { error, value } = validateProject(req.body);
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((item) => item.message),
      });
    }

    const project = await Queries.createStudentWork(value);
    return res.status(201).json(project);
  } catch (err) {
    console.error("CREATE_STUDENT_WORK_ERROR:", err);
    return res.status(500).json({ message: "Failed to create project." });
  }
};

export const handleGetAllStudentWork = async (req, res) => {
  try {
    const projects = await Queries.getAllStudentWork();
    return res.status(200).json(projects);
  } catch (err) {
    console.error("GET_STUDENT_WORK_ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch projects." });
  }
};

export const handleGetPublicStudentWork = async (req, res) => {
  try {
    const projects = await Queries.getPublicStudentWork();
    return res.status(200).json(projects);
  } catch (err) {
    console.error("GET_PUBLIC_STUDENT_WORK_ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch projects." });
  }
};

export const handleUpdateStudentWork = async (req, res) => {
  try {
    const { error, value } = validateProject(req.body);
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((item) => item.message),
      });
    }

    const project = await Queries.updateStudentWork(req.params.id, value);
    if (!project) return res.status(404).json({ message: "Project not found." });

    return res.status(200).json(project);
  } catch (err) {
    console.error("UPDATE_STUDENT_WORK_ERROR:", err);
    return res.status(500).json({ message: "Failed to update project." });
  }
};

export const handleDeleteStudentWork = async (req, res) => {
  try {
    const deleted = await Queries.deleteStudentWork(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Project not found." });

    return res.status(200).json({ message: "Project deleted." });
  } catch (err) {
    console.error("DELETE_STUDENT_WORK_ERROR:", err);
    return res.status(500).json({ message: "Failed to delete project." });
  }
};
