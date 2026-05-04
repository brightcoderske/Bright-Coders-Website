import * as PaymentQueries from "../Database/Config/paymentQueries.js";
import * as RegistrationQueries from "../Database/Config/registrationQueries.js";
import { generateAndSaveReceipt } from "../Utils/receiptsGenerator.js";
import { initiateStkPush, normalizeMpesaPhone } from "../Utils/mpesa.js";
import { sendPaymentConfirmation } from "../Utils/mailer.js";
import cloudinary from "../Utils/cloudinary.js";
import fs from "fs";

const getCallbackValue = (callback, name) => {
  const items = callback?.CallbackMetadata?.Item || [];
  return items.find((item) => item.Name === name)?.Value;
};

const uploadAndSendReceipt = async (registration) => {
  let fileInfo = null;

  try {
    fileInfo = await generateAndSaveReceipt(registration);
    const uploadResponse = await cloudinary.uploader.upload(fileInfo.filePath, {
      folder: "receipts",
      public_id: `Receipt_${registration.registration_number}`,
      resource_type: "raw",
      type: "private",
      flags: "attachment",
    });

    await RegistrationQueries.updateReceiptUrl(
      registration.id,
      uploadResponse.public_id,
    );

    await sendPaymentConfirmation(registration, {
      ...fileInfo,
      downloadUrl: uploadResponse.public_id,
    });
  } finally {
    if (fileInfo?.filePath && fs.existsSync(fileInfo.filePath)) {
      fs.unlinkSync(fileInfo.filePath);
    }
  }
};

export const handleInitiateStkPush = async (req, res) => {
  try {
    const { registrationId, phoneNumber, amount } = req.body;
    const registration = await RegistrationQueries.getRegistrationById(
      registrationId,
    );

    if (!registration) {
      return res.status(404).json({ message: "Registration not found." });
    }

    const paymentAmount = Number(amount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount." });
    }

    if (paymentAmount > Number(registration.balance_due || 0)) {
      return res.status(400).json({ message: "Amount exceeds balance due." });
    }

    const normalizedPhone = normalizeMpesaPhone(phoneNumber);
    if (!/^254\d{9}$/.test(normalizedPhone)) {
      return res.status(400).json({ message: "Invalid M-Pesa phone number." });
    }

    const stkResponse = await initiateStkPush({
      phoneNumber: normalizedPhone,
      amount: paymentAmount,
      accountReference: registration.registration_number,
      transactionDescription: `Bright Coders ${registration.course_name}`,
    });

    if (stkResponse.ResponseCode !== "0") {
      return res.status(400).json({
        message: stkResponse.ResponseDescription || "STK push failed.",
      });
    }

    await PaymentQueries.createMpesaTransaction({
      registrationId: registration.id,
      merchantRequestId: stkResponse.MerchantRequestID,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      phoneNumber: normalizedPhone,
      amount: paymentAmount,
    });

    return res.status(200).json({
      message: "M-Pesa prompt sent. Please enter your PIN on the phone.",
      checkoutRequestId: stkResponse.CheckoutRequestID,
    });
  } catch (err) {
    console.error("INITIATE_STK_PUSH_ERROR:", err);
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Unable to initiate M-Pesa payment." });
  }
};

export const handleMpesaCallback = async (req, res) => {
  const callback = req.body?.Body?.stkCallback;
  if (!callback?.CheckoutRequestID) {
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Ignored" });
  }

  try {
    const checkoutRequestId = callback.CheckoutRequestID;
    const resultCode = Number(callback.ResultCode);
    const amount = Number(getCallbackValue(callback, "Amount") || 0);
    const mpesaReceiptNumber = getCallbackValue(
      callback,
      "MpesaReceiptNumber",
    );

    const transaction = await PaymentQueries.updateMpesaTransactionResult({
      checkoutRequestId,
      status: resultCode === 0 ? "paid" : "failed",
      resultCode,
      resultDescription: callback.ResultDesc,
      mpesaReceiptNumber,
      rawCallback: req.body,
    });

    if (resultCode === 0 && transaction?.registration_id) {
      const registration = await RegistrationQueries.getRegistrationById(
        transaction.registration_id,
      );
      const previousPaid = Number(registration.amount_paid || 0);
      const coursePrice = Number(registration.total_course_price || 0);
      const newTotalPaid = previousPaid + amount;
      const balance = Math.max(0, coursePrice - newTotalPaid);
      const paymentStatus = balance <= 0 ? "paid" : "partial";

      const updated = await RegistrationQueries.updatePaymentStatus(
        registration.id,
        paymentStatus,
        newTotalPaid,
        balance,
        mpesaReceiptNumber || registration.mpesa_code,
      );

      uploadAndSendReceipt(updated).catch((err) =>
        console.error("STK_RECEIPT_ERROR:", err.message),
      );
    }

    return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("MPESA_CALLBACK_ERROR:", err);
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
};
