import axios from "axios";

const requiredEnv = [
  "MPESA_CONSUMER_KEY",
  "MPESA_CONSUMER_SECRET",
  "MPESA_SHORTCODE",
  "MPESA_PASSKEY",
  "MPESA_CALLBACK_URL",
];

export const isMpesaConfigured = () => {
  return requiredEnv.every((key) => Boolean(process.env[key]));
};

const getBaseUrl = () => {
  return process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
};

const getTimestamp = () => {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
};

export const normalizeMpesaPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
};

const getAccessToken = async () => {
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`,
  ).toString("base64");

  const response = await axios.get(
    `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    },
  );

  return response.data.access_token;
};

export const initiateStkPush = async ({
  phoneNumber,
  amount,
  accountReference,
  transactionDescription,
}) => {
  if (!isMpesaConfigured()) {
    const error = new Error("M-Pesa Express is not configured.");
    error.statusCode = 503;
    throw error;
  }

  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const shortcode = process.env.MPESA_SHORTCODE;
  const password = Buffer.from(
    `${shortcode}${process.env.MPESA_PASSKEY}${timestamp}`,
  ).toString("base64");

  const response = await axios.post(
    `${getBaseUrl()}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType:
        process.env.MPESA_TRANSACTION_TYPE || "CustomerPayBillOnline",
      Amount: Math.ceil(Number(amount)),
      PartyA: phoneNumber,
      PartyB: process.env.MPESA_PARTY_B || shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: transactionDescription,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
