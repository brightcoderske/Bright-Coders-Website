import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor (optional: still works if you want extra headers)
axiosInstance.interceptors.request.use(
  (config) => {
    // NO need for Authorization token in headers anymore
    // backend relies on HttpOnly cookie
    const csrfToken = axiosInstance.defaults.headers.common["X-CSRF-Token"];

    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Get the current URL path
      const currentPath = window.location.pathname;

      // Only redirect if it's a 401 AND we are NOT already on the auth page
      if (status === 403) {
        console.error("CSRF Token Error or Access Forbidden.");
        // Optional: Logic to re-fetch the CSRF token could go here
      } else if (
        status === 401 &&
        currentPath !== "/authentication" &&
        !error.config?.url?.includes("/verify-otp")
      ) {
        console.warn("Unauthorized! Redirecting to login...");
        window.location.href = "/authentication";
      } else if (status === 500) {
        console.error("Server error. Please try again later");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
    }

    // This allows your Login.js catch block to actually receive the error
    return Promise.reject(error);
  },
);

export default axiosInstance;
