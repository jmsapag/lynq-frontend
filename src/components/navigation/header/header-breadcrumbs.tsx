import React from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const HeaderBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const getPageTitle = (path: string) => {
    if (path.includes("/connections")) {
      return t("nav.connections", "Connections");
    }
    const cleanPath = path.replace(/^\//, "");
    return cleanPath ? t(`nav.${cleanPath}`) : t("nav.dashboard");
  };

  return (
    <div className="flex items-center">
      <h1 className="text-lg md:text-xl font-semibold text-gray-900">
        {getPageTitle(location.pathname)}
      </h1>
    </div>
  );
};
