import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import { LanguageIcon } from "@heroicons/react/24/outline";
import Dashboard from "./dashboard";

const FreeTrialWrapper = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Free Trial Status Bar */}
      <div className="w-full flex items-center justify-between px-4 py-2 bg-primary text-white text-sm z-20">
        <span>
          {t(
            "freeTrial.demoNotice",
            "You are viewing a demo. Data is for illustration only.",
          )}
        </span>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-1 bg-white text-primary rounded-md font-medium text-sm hover:bg-primary-100 transition"
        >
          {t("freeTrial.login", "Log In")}
        </button>
      </div>

      {/* Language Switch Button - right aligned below status bar */}
      <div className="w-full flex justify-end px-4 py-2">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600"
          title={t("common.changeLanguage", "Change language")}
          aria-label={t("common.changeLanguage", "Change language")}
        >
          <LanguageIcon className="h-5 w-5" />
          <span className="text-xs font-medium">
            {currentLanguage.toUpperCase()}
          </span>
        </button>
      </div>

      {/* Dashboard fills the rest */}
      <div className="flex-1 w-full">
        <Dashboard /* demoMode={true} */ />
      </div>
    </div>
  );
};

export default FreeTrialWrapper;
