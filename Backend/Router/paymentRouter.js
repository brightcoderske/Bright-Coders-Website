import express from "express";
import csrf from "csurf";
import { protect } from "../Middleware/authMiddleware.js";
import {
  handleInitiateStkPush,
  handleMpesaCallback,
} from "../Controller/paymentController.js";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.post("/mpesa/stk-push", handleInitiateStkPush);
router.post("/mpesa/callback", handleMpesaCallback);

router.post(
  "/admin/mpesa/stk-push",
  protect,
  csrfProtection,
  handleInitiateStkPush,
);

export default router;
