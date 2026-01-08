export const getImageUrl = (path) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL; // e.g., http://localhost:8000/api

  if (!path) return "/default-avatar.png"; // Return a local placeholder if null

  if (path.startsWith("http")) return path;

  // 1. Remove "api/" or "/api/" from the start if it exists
  let cleanPath = path.replace(/^\/?api\//, "");

  // 2. Remove the leading slash from the path so we don't get double slashes
  // converts "/uploads/img.png" to "uploads/img.png"
  cleanPath = cleanPath.startsWith("/") ? cleanPath.substring(1) : cleanPath;

  // 3. Combine. result: http://localhost:8000/api/uploads/img.png
  return `${API_URL.replace(/\/$/, "")}/${cleanPath}`;
};
