import React from "react";
import { useTranslation } from "react-i18next";

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-2">
      <div className="container mx-auto px-4">
        <div className="flex justify-end items-center">
          <div className="text-sm text-gray-500">
            {t("footer.rights", { year: currentYear })}
          </div>
          <div className="flex space-x-4"></div>
        </div>
      </div>
    </footer>
  );
};
