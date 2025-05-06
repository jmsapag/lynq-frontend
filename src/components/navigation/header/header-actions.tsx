import React from "react";
import { BellIcon, LanguageIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../../hooks/useLanguage.ts";

export const HeaderActions: React.FC = () => {
  const { t } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguage();

  const handleLanguageToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLanguage();
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
      <button
        className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5" />
      </button>
    </div>
  );
};
