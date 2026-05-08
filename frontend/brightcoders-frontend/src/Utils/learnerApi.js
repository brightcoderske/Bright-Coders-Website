import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const baseURL = rawBaseUrl.replace(/\/$/, "").endsWith("/api")
  ? rawBaseUrl.replace(/\/$/, "")
  : `${rawBaseUrl.replace(/\/$/, "")}/api`;

const learnerApi = axios.create({
  baseURL,
  withCredentials: true,
});

export default learnerApi;
