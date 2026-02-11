import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import { validate } from "../Middleware/validate.js";
import {
  handleAddRegistration,
  handleGetAllRegistrations,
  handleUpdatePayment,
  handleIssueCertificate,
  handleDeleteRegistration,
  handleVerifyCertificate,
  downloadReceipt,
} from "../Controller/registrationController.js";
import path from "path";
import fs from "fs";
import rateLimit from "express-rate-limit";
import csrf from "csurf";
import cloudinary from "../Utils/cloudinary.js";

const csrfProtection = csrf({ cookie: true });

const router = express.Router();

// Define the limit: 10 requests per 15 minutes per IP
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many verification attempts. Please try again in 15 minutes.",
  },
});

// ==========================
// --- PUBLIC ROUTES ---
// ==========================
// Anyone can submit a registration
router.post("/", handleAddRegistration);
router.get("/verify/:regNumber", verifyLimiter, handleVerifyCertificate);

// ==========================
// --- ADMIN ROUTES (Protected) ---
// ==========================

// Get all registrations (drafts + completed) for admin dashboard
router.get("/StudentsRegistration", protect, csrfProtection, handleGetAllRegistrations);

// Update payment or receipt status
router.patch("/payment/:id", protect, csrfProtection, handleUpdatePayment);

// Issue certificate / mark completion
router.patch("/certificate/:id", protect, csrfProtection, handleIssueCertificate);

// Delete a registration
router.delete("/:id", protect, csrfProtection, handleDeleteRegistration);

router.get(
  "/download-receipt/:id",
  protect,
  csrfProtection,
  downloadReceipt
);


export default router;
