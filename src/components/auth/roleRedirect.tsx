import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRoleFromToken } from "../../hooks/auth/useAuth.ts";

const RoleRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = getUserRoleFromToken();
    if (role === "LYNQ_TEAM") {
      navigate("/businesses", { replace: true });
    } else {
      navigate("/overview", { replace: true });
    }
  }, [navigate]);

  return null;
};

export default RoleRedirect;
