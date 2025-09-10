import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Dashboard from "./dashboard";

const FreeTrialWrapper = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      {/* Dashboard fills the rest */}
      <div className="flex-1 w-full">
        <Dashboard /* demoMode={true} */ />
      </div>
    </div>
  );
};

export default FreeTrialWrapper;
