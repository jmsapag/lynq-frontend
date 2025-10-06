import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { hasSubscriptionAccess } from "../../hooks/auth/useAuth";

export function PrivateRoute() {
  const token = Cookies.get("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check subscription access, passing current path
  const hasAccess = hasSubscriptionAccess(location.pathname);

  if (!hasAccess) {
    return <Navigate to="/billing/subscription" replace />;
  }

  return <Outlet />;
}
