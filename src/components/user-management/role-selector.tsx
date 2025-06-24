import React, { useState } from "react";
import { Select, SelectItem } from "@heroui/react";
import { useTranslation } from "react-i18next";

interface RoleSelectorProps {
  userId: number;
  initialRole: string;
  currentUserRole: string;
  onRoleChange?: (userId: number, newRole: string) => void;
}

export const RoleSelector = ({
  userId,
  initialRole,
  currentUserRole,
  onRoleChange,
}: RoleSelectorProps) => {
  const { t } = useTranslation();
  const [currentRole, setCurrentRole] = useState(initialRole);
  const availableRoles = ["LYNQ_TEAM", "ADMIN", "STANDARD"];

  const roles: string[] = availableRoles.filter((r) => {
    return availableRoles.indexOf(currentUserRole) <= availableRoles.indexOf(r);
  });

  type colorType =
    | "default"
    | "success"
    | "primary"
    | "secondary"
    | "warning"
    | "danger"
    | undefined;

  const roleColors: Record<string, colorType> = {
    LYNQ_TEAM: "danger",
    ADMIN: "warning",
    STANDARD: "success",
  };

  const roleIndex = roles.indexOf(currentRole);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole: number = parseInt(e.target.value, 10);
    if (onRoleChange) {
      setCurrentRole(roles[newRole]);
      onRoleChange(userId, roles[newRole]);
    }
  };

  return (
    <Select
      defaultSelectedKeys={roleIndex !== -1 ? [`${roleIndex}`] : []}
      color={roleColors[currentRole] || "default"}
      onChange={handleChange}
      size="sm"
      className="w-36"
    >
      {roles.map((r, index) => (
        <SelectItem key={`${index}`}>{t(`role.${r}`)}</SelectItem>
      ))}
    </Select>
  );
};

export default RoleSelector;
