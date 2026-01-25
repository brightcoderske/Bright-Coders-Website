import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../Components/Context/UserContext";

const ProtectedRoute = () => {
  const { user, loading } = useContext(UserContext);

  console.log("🛡️ [ProtectedRoute] user:", user, "| loading:", loading);

  if (loading) {
    console.log("⏳ [ProtectedRoute] Still loading, showing spinner...");
    return <div>Loading...</div>;
  }

  if (!user) {
    console.warn("🚫 [ProtectedRoute] No user found, redirecting to login.");
    return <Navigate to="/authentication" replace />;
  }

  console.log("🔓 [ProtectedRoute] Access granted.");
  return <Outlet />;
};
export default ProtectedRoute;
