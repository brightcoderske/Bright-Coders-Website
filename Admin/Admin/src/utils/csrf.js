import { API_PATHS } from "./apiPaths";
import axiosInstance from "./axiosInstance";

export const fetchCsrfToken = async () => {
  try {
    const res = await axiosInstance.get(API_PATHS.SECURITY.CSRF_TOKEN);
    axiosInstance.defaults.headers.common["X-CSRF-Token"] = res.data.csrfToken;
    console.log("✅ CSRF token set");
  } catch (err) {
    console.error("Failed to fetch CSRF token:", err);
  }
};
