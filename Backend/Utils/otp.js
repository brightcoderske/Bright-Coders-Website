import crypto from "crypto";

export const generateOTP = () => {
 // Generates a cryptographically strong random value
  return crypto.randomInt(100000, 999999).toString();
};



export const canResendOTP = (user) => {
  if (!user.otp_last_sent) return true;
  const diff = Date.now() - new Date(user.otp_last_sent).getTime();
  return diff > 60 * 1000; // 60 seconds
};
