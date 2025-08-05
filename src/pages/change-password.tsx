import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addToast } from "@heroui/react";
import { useChangePassword } from "../hooks/auth/useChangePassword.ts";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage.ts";
import { LanguageIcon } from "@heroicons/react/24/outline";
import {
  BackgroundShapes,
  RightPanelGradients,
} from "../components/auth/background.tsx";

export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { changePassword, loading } = useChangePassword();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      addToast({
        title: t("toasts.changePasswordErrorTitle"),
        description: t("toasts.changePasswordErrorDescription"),
        severity: "danger",
        color: "danger",
      });
      navigate("/login");
    }
  }, [token, navigate, t]);

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    
    if (!formData.password) {
      newErrors.password = t("changePassword.passwordRequired");
    } else if (!validatePassword(formData.password)) {
      newErrors.password = t("changePassword.passwordTooShort");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("changePassword.confirmPasswordRequired");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("changePassword.passwordsDoNotMatch");
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
      await changePassword(token!, formData.password);
      addToast({
        title: t("toasts.changePasswordSuccessTitle"),
        description: t("toasts.changePasswordSuccessDescription"),
        severity: "success",
        color: "success",
      });
      navigate("/login");
    } catch (error) {
      addToast({
        title: t("toasts.changePasswordErrorTitle"),
        description: t("toasts.changePasswordErrorDescription"),
        severity: "danger",
        color: "danger",
      });
    }
  };

  if (!token) {
    return null;
  }

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
              {t("changePassword.title")}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {t("changePassword.subtitle")}
            </p>
          </div>

          <form
            className="w-full space-y-6"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className={`block w-full px-4 py-3 bg-white border-b-2 ${
                  errors.password ? "border-red-400" : "border-gray-500"
                } text-base rounded-t-md focus:outline-none focus:border-black transition placeholder-gray-400`}
                placeholder={t("changePassword.passwordPlaceholder")}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? t("login.hidePassword") : t("login.showPassword")
                }
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.72 11.72 0 012.92-4.36M6.7 6.7A9.97 9.97 0 0112 5c5 0 9.27 3.11 11 7.5a11.72 11.72 0 01-4.06 5.19M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full px-4 py-3 bg-white border-b-2 ${
                  errors.confirmPassword ? "border-red-400" : "border-gray-500"
                } text-base rounded-t-md focus:outline-none focus:border-black transition placeholder-gray-400`}
                placeholder={t("changePassword.confirmPasswordPlaceholder")}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? t("login.hidePassword") : t("login.showPassword")
                }
              >
                {showConfirmPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.72 11.72 0 012.92-4.36M6.7 6.7A9.97 9.97 0 0112 5c5 0 9.27 3.11 11 7.5a11.72 11.72 0 01-4.06 5.19M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
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
                  {t("changePassword.submitButton")}
                </span>
              ) : (
                t("changePassword.submitButton")
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