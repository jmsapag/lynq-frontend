import React from "react";
import { MobileSidebarToggle } from "./sidebar.tsx";

interface HeaderProps {
  onMobileToggleClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileToggleClick }) => {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 md:justify-end">
      <MobileSidebarToggle onClick={onMobileToggleClick} />

      <div className="flex items-center gap-4"></div>
    </header>
  );
};

export default Header;
