import React from "react";
import { Sidebar } from "./sidebar.tsx";

interface SidebarWithStateProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarWithState: React.FC<SidebarWithStateProps> = ({
  isOpen,
  onClose,
}) => {
  return <Sidebar isOpen={isOpen} onClose={onClose} />;
};
