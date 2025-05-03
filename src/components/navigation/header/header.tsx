import React from "react";
import { MobileMenuButton } from "./mobile-menu-button.tsx";
import { HeaderActions } from "./header-actions.tsx";
import { HeaderBreadcrumbs } from "./header-breadcrumbs.tsx";

interface HeaderProps {
  onMobileToggleClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileToggleClick }) => {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-4">
        <MobileMenuButton onClick={onMobileToggleClick} />
        <HeaderBreadcrumbs />
      </div>
      <HeaderActions />
    </header>
  );
};

export default Header;
