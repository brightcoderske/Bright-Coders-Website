import { query } from "./config.db.js";

export const paymentTableSchema = `
CREATE TABLE IF NOT EXISTS mpesa_transactions (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER REFERENCES registrations(id) ON DELETE SET NULL,
  merchant_request_id VARCHAR(120),
  checkout_request_id VARCHAR(120) UNIQUE,
  phone_number VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'initiated',
  result_code INTEGER,
  result_description TEXT,
  mpesa_receipt_number VARCHAR(80),
  raw_callback JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export const createMpesaTransaction = async ({
  registrationId,
  merchantRequestId,
  checkoutRequestId,
  phoneNumber,
  amount,
}) => {
  const rows = await query(
    `
    INSERT INTO mpesa_transactions (
      registration_id, merchant_request_id, checkout_request_id, phone_number, amount
    )
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [registrationId, merchantRequestId, checkoutRequestId, phoneNumber, amount],
  );

  return rows[0];
};

export const getTransactionByCheckoutRequestId = async (checkoutRequestId) => {
  const rows = await query(
    `SELECT * FROM mpesa_transactions WHERE checkout_request_id = $1`,
    [checkoutRequestId],
  );
  return rows[0];
};

export const updateMpesaTransactionResult = async ({
  checkoutRequestId,
  status,
  resultCode,
  resultDescription,
  mpesaReceiptNumber,
  rawCallback,
}) => {
  const rows = await query(
    `
    UPDATE mpesa_transactions
    SET status = $1,
        result_code = $2,
        result_description = $3,
        mpesa_receipt_number = $4,
        raw_callback = $5,
        updated_at = CURRENT_TIMESTAMP
    WHERE checkout_request_id = $6
    RETURNING *
    `,
    [
      status,
      resultCode,
      resultDescription,
      mpesaReceiptNumber,
      rawCallback,
      checkoutRequestId,
    ],
  );

  return rows[0];
};
