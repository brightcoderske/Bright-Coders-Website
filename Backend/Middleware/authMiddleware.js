import jwt from "jsonwebtoken";
import { findUserById } from "../Database/Config/config.db.js";

export const protect = async (request, response, next) => {
  try {
    // ✅ 1. Read token from cookies
    const token = request.cookies?.access_token;
    if (!token) {
      return response.status(401).json({ message: "Not authenticated" });
    }

    // ✅ 2. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ 3. Fetch user
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    // ✅ 4. Attach user to request
    request.user = user;
    next();
  } catch (error) {
    console.error("Auth Error: ", error);
    return response.status(401).json({ message: "Invalid or expired token" });
  }
};
