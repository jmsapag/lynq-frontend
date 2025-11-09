import React from "react";
import { BellIcon, LanguageIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Badge } from "@heroui/react";
import { useLanguage } from "../../../hooks/useLanguage.ts";
import { useAlerts } from "../../../hooks/alerts/useAlerts.ts";

export const HeaderActions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toggleLanguage, currentLanguage } = useLanguage();
  const { unreadCount } = useAlerts();

  const handleLanguageToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLanguage();
  };

  const handleAlertsClick = () => {
    navigate("/alerts");
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleLanguageToggle}
        title={t("common.changeLanguage")}
        className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600"
      >
        <div className="flex items-center gap-2">
          <LanguageIcon className="h-5 w-5" />
          <span className="text-xs font-medium">
            {currentLanguage.toUpperCase()}
          </span>
        </div>
      </button>
      <Badge
        content={unreadCount > 0 ? unreadCount : null}
        color="danger"
        size="sm"
        isInvisible={unreadCount === 0}
      >
        <button
          onClick={handleAlertsClick}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600"
          aria-label={t("alerts.notifications", "Notifications")}
        >
          <BellIcon className="h-5 w-5" />
        </button>
      </Badge>
    </div>
  );
};
