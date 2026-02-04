import express from "express";
import { protect } from "../Middleware/authMiddleware.js";

import {
  handleRequestStepUpOTP,
  handleVerifyStepUpOTP,
} from "../Controller/stepUpController.js";
import { csrfProtection } from "../Middleware/csrfMiddleware.js";


const router = express.Router();

/* =========================
   STEP-UP VERIFICATION ROUTES
========================= */

// Request OTP
router.post(
  "/request",
  protect,
  csrfProtection,
  handleRequestStepUpOTP
);

// Verify OTP
router.post(
  "/verify",
  protect,
  csrfProtection,
  handleVerifyStepUpOTP
);

export default router;
