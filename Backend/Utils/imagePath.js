export const getImageUrl = (path) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  if (!path) return null;

  // 1. If it's already a full URL (Unsplash, Cloudinary), return as is
  if (path.startsWith("http")) return path;

  // 2. Ensure we use the /api/uploads prefix 
  // Clean the path to remove any existing '/api' or extra slashes
  const cleanPath = path.replace(/^\/?api\//, "").replace(/^\/+/, "");
  
  // Return the base API URL + the cleaned path
  return `${API_URL.replace(/\/$/, "")}/${cleanPath}`;
};