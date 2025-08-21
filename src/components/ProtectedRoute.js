import { Navigate } from "react-router-dom";
import { isLoggedIn, getUserRole } from "../auth/auth";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const userRole = getUserRole();

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />; // Create this route
  }

  return children;
};

export default ProtectedRoute;
