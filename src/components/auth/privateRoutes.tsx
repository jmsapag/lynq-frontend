import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

export function PrivateRoute() {
  const token = Cookies.get("token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
