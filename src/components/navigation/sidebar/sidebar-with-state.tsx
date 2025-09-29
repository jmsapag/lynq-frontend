import React from "react";
import { Sidebar } from "./sidebar.tsx";

interface SidebarWithStateProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export const SidebarWithState: React.FC<SidebarWithStateProps> = ({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}) => {
  return (
    <Sidebar
      isOpen={isOpen}
      isCollapsed={isCollapsed}
      onClose={onClose}
      onToggleCollapse={onToggleCollapse}
    />
  );
};
