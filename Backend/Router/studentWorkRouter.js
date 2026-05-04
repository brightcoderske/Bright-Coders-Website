import express from "express";
import csrf from "csurf";
import { protect } from "../Middleware/authMiddleware.js";
import {
  handleCreateStudentWork,
  handleDeleteStudentWork,
  handleGetAllStudentWork,
  handleGetPublicStudentWork,
  handleUpdateStudentWork,
} from "../Controller/studentWorkController.js";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.get("/live", handleGetPublicStudentWork);

router.get("/", protect, csrfProtection, handleGetAllStudentWork);
router.post("/", protect, csrfProtection, handleCreateStudentWork);
router.put("/:id", protect, csrfProtection, handleUpdateStudentWork);
router.delete("/:id", protect, csrfProtection, handleDeleteStudentWork);

export default router;
