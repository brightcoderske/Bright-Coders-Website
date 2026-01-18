import { useState, useRef, useEffect } from "react";
import "./OTPVerify.css";
import axios from "axios";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";

export default function OTPVerify({ tempToken, onSuccess,onCancel  }) {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  // Focus the first input on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Move to next input if value is entered
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) return setError("Please enter all 6 digits");

    try {
      setLoading(true);
      setError("");
      const res = await axios.post(
  "http://localhost:8000/api/auth/verify-otp",
  { otp: otpCode },
  {
    headers: {
      Authorization: `Bearer ${tempToken}`,
    },
  }
);
      onSuccess(res.data.token, res.data.user);
    } catch (err) {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h2>Verify Account</h2>
        <p>Enter the 6-digit code sent to your email.</p>

        <div className="otp-inputs-row">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              ref={(el) => (inputRefs.current[index] = el)}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="otp-digit-input"
            />
          ))}
        </div>

        {error && <div className="otp-error-msg">{error}</div>}

<button
  className="otp-cancel-btn"
  onClick={onCancel}
  disabled={loading}
>
  Cancel
</button>


        <button
          className="otp-verify-btn"
          onClick={handleVerify}
          disabled={loading || otp.join("").length < 6}
        >
          {loading ? <div className="otp-spinner"></div> : "Verify & Continue"}
        </button>
      </div>
    </div>
  );
}
