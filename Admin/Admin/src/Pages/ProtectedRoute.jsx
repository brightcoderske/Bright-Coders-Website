import { Navigate, Outlet } from "react-router-dom";
import { isTokenExpired } from "../utils/tokenUtils";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  let redirect = false;

  if (!token) {
    redirect = true;
  } else {
    try {
      if (isTokenExpired(token)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("2fa_temp");
        redirect = true;
      }
    } catch (error) {
      console.error("Token error:", error);
      localStorage.clear();
      redirect = true;
    }
  }

  if (redirect) {
    return <Navigate to="/authentication" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
