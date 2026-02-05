import crypto from "crypto";
import bcrypt from "bcryptjs";

import {
  saveStepUpOTP,
  getStepUpData,
  markStepUpVerified,
  incrementStepUpAttempts,
} from "../Database/Config/stepUpQueries.js";
import { deleteAdminById, getAdminAuthData, getAdminById, updateAdminPassword, updateAdminProfile } from "../Database/Config/adminQueries.js";
import { findUserById } from "../Database/Config/config.db.js";
import { sendStepUpOTPEmail } from "../Utils/mailer.js";

/* =========================
   GET ADMIN PROFILE
========================= */
export const handleGetAdminProfile = async (request, response) => {
  const admin = await getAdminById(request.user.id);
  response.status(200).json(admin);
};

/* =========================
   UPDATE ADMIN PROFILE
========================= */
export const handleUpdateAdminProfile = async (request, response) => {
  const adminId = request.user.id;
  const { username, profile_image_url } = request.body;

  const updated = await updateAdminProfile(
    adminId,
    username,
    profile_image_url
  );

  response.status(200).json({
    message: "Admin profile updated",
    admin: updated,
  });
};

/* =========================
   CHANGE PASSWORD
========================= */
export const changeAdminPassword = async (request, response) => {
  const adminId = request.user.id;
  const { newPassword } = request.body;

  const hash = await bcrypt.hash(newPassword, 12);
  await updateAdminPassword(adminId, hash);

  response.status(200).json({
    message: "Password changed successfully",
  });
};



/* =========================
   DELETE ADMIN ACCOUNT
   (STEP-UP REQUIRED)
========================= */
export const handleDeleteAdminAccount = async (request, response) => {

  try {

    const adminId = request.user.id;
  const { password } = request.body;

  

  // 1️⃣ Get admin
  const admin = await getAdminAuthData(adminId);
  if (!admin) {
    return response.status(404).json({ message: "Admin not found" });
  }


  console.log("Input Password:", password);
    console.log("Stored Hash:", admin.password_hash);

  // 2️⃣ Enforce step-up verification
  if (!admin.last_verified) {
    return response.status(403).json({
      message: "Step-up verification required before deleting account",
    });
  }

  //  Step-up freshness (10 mins)
  const TEN_MINUTES = 10 * 60 * 1000;
  if (Date.now() - new Date(admin.last_verified).getTime() > TEN_MINUTES) {
    return response.status(403).json({
      message: "Step-up verification expired. Please verify again.",
    });
  }

  if (!password || !admin.password_hash) {
      return response.status(400).json({ 
        message: "Authentication data missing. Password or hash undefined." 
      });
    }
  // 3️⃣ Confirm password (VERY IMPORTANT)
  const passwordMatch = await bcrypt.compare(password, admin.password_hash);
  if (!passwordMatch) {
    return response.status(401).json({ message: "Invalid password" });
  }

  // 4️⃣ Delete admin
  const deleted = await deleteAdminById(adminId);

  response.status(200).json({
    message: "Admin account deleted permanently",
    admin: deleted,
  });
    
  } catch (error) {
    console.error("Internal Deletion Error:", error);
    response.status(500).json({ message: "Internal server error during deletion" });
  }

  
};
