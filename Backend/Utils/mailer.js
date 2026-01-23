import { Resend } from "resend";
import fs from "fs";

// Initialize Resend with your API Key from Render Environment Variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Verification check for the API key
if (!process.env.RESEND_API_KEY) {
  console.log("Resend API Key is missing! ❌");
} else {
  console.log("Resend Mailer is configured and ready ✅");
}

export const sendPaymentConfirmation = async (studentData, fileInfo) => {
  try {
    let attachments = [];
    if (fileInfo?.filePath) {
      const fileBuffer = fs.readFileSync(fileInfo.filePath);

      attachments.push({
        filename: fileInfo.fileName,
        content: fileBuffer.toString("base64"),
      });
    }
    const { data, error } = await resend.emails.send({
      from: "Bright Coders <onboarding@resend.dev>", // Free tier requirement
      to: studentData.parent_email,
      subject: `Payment Confirmed: Enrollment for ${studentData.child_name}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="background-color: #2563eb; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Enrollment Confirmed!</h1>
          </div>
          <div style="padding: 30px; color: #333333;">
            <p style="font-size: 16px;">Hello <strong>${studentData.parent_name}</strong>,</p>
            <p>Great news! We have successfully verified your payment. <strong>${studentData.child_name}</strong> is now officially enrolled in our upcoming cohort.</p>
            <div style="background-color: #f8fafc; border-radius: 6px; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2563eb; font-size: 14px; text-transform: uppercase;">Registration Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 0; color: #64748b;">Student ID:</td><td style="padding: 5px 0; font-weight: bold;">${studentData.registration_number}</td></tr>
                <tr><td style="padding: 5px 0; color: #64748b;">Course:</td><td style="padding: 5px 0; font-weight: bold;">${studentData.course_name}</td></tr>
                <tr><td style="padding: 5px 0; color: #64748b;">Schedule:</td><td style="padding: 5px 0; font-weight: bold;">${studentData.preferred_time}</td></tr>
              </table>
            </div>
            <p><strong>Next Steps:</strong></p>
            <ul style="padding-left: 20px;">
              <li>Our instructor will add you to the WhatsApp class group within 24 hours.</li>
              <li>Ensure the student has a laptop and stable internet as indicated in your profile.</li>
            </ul>
          </div>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
            &copy; 2026 Bright Coders Academy. All rights reserved.
          </div>
        </div>
      `,
      attachments,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Payment Email Error:", error);
    throw error;
  }
};

export const sendOTPEmail = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Bright Coders <onboarding@resend.dev>",
      to: email,
      subject: "Your Login Verification Code",
      html: `
        <div style="max-width: 500px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #2563eb; text-align: center;">Two-Factor Authentication</h2>
          <p>Hello,</p>
          <p>Your one-time verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0; color: #111827;">
            ${otp}
          </div>
          <p>This code will expire in <strong>5 minutes</strong>.</p>
          <hr style="margin: 30px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">© 2026 Bright Coders Academy</p>
        </div>
      `,
    });
    if (error) throw error;
    console.log("OTP sent via Resend:", data.id);
    return true;
  } catch (error) {
    console.error("[OTP Email Error]:", error);
    throw error;
  }
};

export const sendAdminNotification = async (subject, htmlContent) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Academy Alerts <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL,
      subject: subject,
      html: htmlContent,
    });
    if (error) throw error;
    console.log("Admin notification sent via Resend!");
  } catch (error) {
    console.error("Admin Email failed:", error);
  }
};
