import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptors

// Response interceptors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Get the current URL path
      const currentPath = window.location.pathname;

      // Only redirect if it's a 401 AND we are NOT already on the auth page
      if (
        status === 401 &&
        currentPath !== "/authentication" &&
        !error.config?.url?.includes("/verify-otp")
      ) {
        console.warn("Unauthorized! Redirecting to login...");
        localStorage.removeItem("token"); // Optional: clear stale token
        window.location.href = "/authentication";
      } else if (status === 500) {
        console.error("Server error. Please try again later");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
    }

    // This allows your Login.js catch block to actually receive the error
    return Promise.reject(error);
  }
);

export default axiosInstance;
