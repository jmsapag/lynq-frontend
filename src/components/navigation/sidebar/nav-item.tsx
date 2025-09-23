import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface NavItemProps {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  isCollapsed?: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({
  title,
  href,
  icon: Icon,
  badge,
  isCollapsed = false,
}) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const isActive = pathname === href;

  if (isCollapsed) {
    return (
      <Link
        to={href}
        className={`group flex items-center justify-center rounded-lg p-3 text-sm font-medium transition-all relative ${
          isActive
            ? "bg-gray-200 text-gray-900"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
        title={t(`nav.${title}`)}
      >
        <Icon
          className={`h-5 w-5 ${
            isActive
              ? "text-gray-700"
              : "text-gray-500 group-hover:text-gray-700"
          }`}
        />
        {badge && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
        )}
      </Link>
    );
  }

  return (
    <Link
      to={href}
      className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
        isActive
          ? "bg-gray-200 text-gray-900"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={`h-5 w-5 ${
            isActive
              ? "text-gray-700"
              : "text-gray-500 group-hover:text-gray-700"
          }`}
        />
        <span>{t(`nav.${title}`)}</span>
      </div>
      {badge && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            isActive
              ? "bg-gray-300 text-gray-800"
              : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-800"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
};
