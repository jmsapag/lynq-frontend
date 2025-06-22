import React, { useState } from "react";
import { Select, SelectItem } from "@heroui/react";

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
    LYNQ_TEAM: "success",
    ADMIN: "primary",
    STANDARD: "secondary",
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
      className={"w-36"}
      color={roleColors[currentRole] || "default"}
      onChange={handleChange}
    >
      {roles.map((r, index) => (
        <SelectItem key={`${index}`}>{r}</SelectItem>
      ))}
    </Select>
  );
};

export default RoleSelector;
