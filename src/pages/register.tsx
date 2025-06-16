import { useState } from "react";
import RegisterForm, {
  RegisterFormData,
} from "../components/auth/registerForm";
import {
  BackgroundShapes,
  RightPanelGradients,
} from "../components/auth/background";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import { LanguageIcon } from "@heroicons/react/24/outline";

export default function RegisterPage() {
  const { t } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguage();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    surname: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Partial<RegisterFormData> = {};
    if (!formData.name)
      newErrors.name = t("register.nameRequired", "Name is required");
    if (!formData.surname)
      newErrors.surname = t("register.surnameRequired", "Surname is required");
    if (!formData.email)
      newErrors.email = t("register.emailRequired", "Email is required");
    if (!formData.phone)
      newErrors.phone = t("register.phoneRequired", "Phone is required");
    if (!formData.password)
      newErrors.password = t(
        "register.passwordRequired",
        "Password is required",
      );

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

    setLoading(true);
    try {
      // TODO: Replace with your registration logic (API call)
      // await register(formData);
      addToast({
        title: t("toasts.registerSuccessTitle", "Registration successful"),
        description: t(
          "toasts.registerSuccessDescription",
          "You can now log in.",
        ),
        severity: "success",
        color: "success",
      });
      navigate("/login");
    } catch (error) {
      addToast({
        title: t("toasts.registerFailedTitle", "Registration failed"),
        description: t("toasts.registerFailedDescription", "Please try again."),
        severity: "danger",
        color: "danger",
      });
    } finally {
      setLoading(false);
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
              {t("register.title", "Create your account")}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {t(
                "register.subtitle",
                "Sign up to start exploring your metrics.",
              )}
            </p>
          </div>
          <RegisterForm
            formData={formData}
            errors={errors}
            isLoading={loading}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            t={t as (key: string, defaultValue?: string) => string}
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
