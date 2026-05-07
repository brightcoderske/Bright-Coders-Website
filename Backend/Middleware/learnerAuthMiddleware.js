import jwt from "jsonwebtoken";
import { findLearnerById } from "../Database/Config/lmsQueries.js";

export const learnerCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 1000 * 60 * 60 * 6,
};

export const protectLearner = async (req, res, next) => {
  try {
    const token = req.cookies?.learner_token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "learner") {
      return res.status(401).json({ message: "Invalid learner session" });
    }

    const learner = await findLearnerById(decoded.id);
    if (!learner || !learner.is_active) {
      return res.status(401).json({ message: "Learner account inactive" });
    }

    req.learner = learner;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
};
