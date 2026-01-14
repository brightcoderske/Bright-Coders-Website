import { Navigate, Outlet } from "react-router-dom";
import { isTokenExpired } from "../utils/tokenUtils";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  // If not logged in → go to login
  if (!token) {
    return <Navigate to="/authentication" replace />;
  }

    // If token exists but expired → log out
if (isTokenExpired(token)) {
    localStorage.removeItem("token");
    return <Navigate to="/authentication" replace />;
  }

  // If logged in → allow access
  return <Outlet />;
};

export default ProtectedRoute;
