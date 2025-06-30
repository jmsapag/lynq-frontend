import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/react";
import { useForgotPassword } from "../hooks/auth/useForgotPassword.ts";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage.ts";
import { LanguageIcon } from "@heroicons/react/24/outline";
import {
  BackgroundShapes,
  RightPanelGradients,
} from "../components/auth/background.tsx";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { forgotPassword, loading } = useForgotPassword();

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrors({ ...errors, email: undefined });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = t("forgotPassword.emailRequired");
    } else if (!validateEmail(email)) {
      newErrors.email = t("forgotPassword.invalidEmail");
    }

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
      await forgotPassword(email);
      addToast({
        title: t("toasts.forgotPasswordSuccessTitle"),
        description: t("toasts.forgotPasswordSuccessDescription"),
        severity: "success",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: t("toasts.forgotPasswordErrorTitle"),
        description: t("toasts.forgotPasswordErrorDescription"),
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
              {t("forgotPassword.title")}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {t("forgotPassword.subtitle")}
            </p>
          </div>

          <form
            className="w-full space-y-6"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={handleChange}
                className={`block w-full px-4 py-3 bg-white border-b-2 ${
                  errors.email ? "border-red-400" : "border-gray-500"
                } text-base rounded-t-md focus:outline-none focus:border-black transition placeholder-gray-400`}
                placeholder={t("forgotPassword.emailPlaceholder")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-base font-semibold text-white bg-black transition-all
              hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 active:scale-95 ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  {t("forgotPassword.submitButton")}
                </span>
              ) : (
                t("forgotPassword.submitButton")
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-[#00A5B1] hover:underline transition"
              >
                {t("forgotPassword.backToLogin")}
              </button>
            </div>
          </form>
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