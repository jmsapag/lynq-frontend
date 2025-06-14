import { useEffect, useState } from "react";
import { LoginForm } from "../components/login/loginForm.tsx";
import {
  BackgroundShapes,
  RightPanelGradients,
} from "../components/login/background.tsx";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/react";
import { useLogin } from "../hooks/useAuth.ts";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage.ts";
import { LanguageIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const { t } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguage();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const navigate = useNavigate();
  const { login, loading } = useLogin();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast({
        title: t("toasts.formErrorTitle"),
        description: t("toasts.formErrorDescription"),
        severity: "danger",
        color: "danger",
      });
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate("/home");
    } catch (error) {
      addToast({
        title: t("toasts.loginFailedTitle"),
        description: t("toasts.loginFailedDescription"),
        severity: "danger",
        color: "danger",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white relative flex">
      {/* Language Switch Button */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 flex items-center gap-2 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 z-20"
        title={t("common.changeLanguage")}
      >
        <LanguageIcon className="h-5 w-5" />
        <span className="text-xs font-medium">
          {currentLanguage.toUpperCase()}
        </span>
      </button>

      {/* Left panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 relative z-10">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {t("login.welcome", "Welcome back!")}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {t("login.subtitle", "Login to continue exploring your metrics.")}
            </p>
          </div>
          <LoginForm
            formData={formData}
            errors={errors}
            isLoading={loading}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            t={t}
          />
        </div>
        <BackgroundShapes />
      </div>

      {/* Right panel */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#F0FAFB] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <RightPanelGradients />
        </div>
      </div>
    </div>
  );
}
