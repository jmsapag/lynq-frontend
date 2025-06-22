import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  navItems,
  superAdminNavItems,
  adminNavItems,
} from "./navigation-config.ts";
import { NavItem } from "./nav-item.tsx";
import { ProfileMenu } from "./profile-menu.tsx";
import logoImage from "../../../assets/logo.png";
import Cookies from "js-cookie";
import { useUserProfile } from "../../../hooks/users/useUserProfile";
import { useUserId } from "../../../hooks/auth/useUserId";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const userId = useUserId();
  const { user, loading } = useUserProfile(userId);

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/login", { replace: true });
  };

  let items = navItems;
  if (user?.role === "LYNQ_TEAM") {
    items = superAdminNavItems;
  } else if (user?.role === "ADMIN") {
    items = adminNavItems;
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white text-black">
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-200 px-4">
        <Link to="/dashboard" className="flex items-center">
          <img src={logoImage} alt="Company Logo" className="h-10 w-auto" />
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <nav className="grid gap-1 px-3 py-2">
            {items.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>
        </div>
        <div className="border-t border-gray-200 p-2">
          {loading || !user ? (
            <div className="text-xs text-gray-400 px-2 py-3">Loading...</div>
          ) : (
            <ProfileMenu
              user={{ name: user.name, role: user.role }}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </div>
  );

  if (isOpen === undefined || !onClose) {
    return <SidebarContent />;
  }

  return (
    <div className="flex h-full">
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-gray-200 bg-white p-0 transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-50 text-gray-500 hover:text-black"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
        <SidebarContent />
      </aside>

      <aside className="hidden border-r border-gray-200 bg-white md:flex md:w-72 md:flex-col">
        <SidebarContent />
      </aside>
    </div>
  );
};
