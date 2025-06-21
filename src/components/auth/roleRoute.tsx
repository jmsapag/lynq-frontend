import { Navigate, Outlet } from "react-router-dom";
import { getUserRoleFromToken } from "../../hooks/auth/useAuth";

interface RoleRouteProps {
  allowedRoles: string | string[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const userRole = getUserRoleFromToken();

  // Check if user role matches any of the allowed roles
  const hasAccess = () => {
    if (!userRole) return false;

    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(userRole);
    }

    return userRole === allowedRoles;
  };

  if (hasAccess()) {
    return <Outlet />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
}
