import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  formData: RegisterFormData;
  errors: Partial<RegisterFormData>;
  isLoading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  t: (key: string, defaultValue?: string) => string;
}

export function RegisterForm({
  formData,
  errors,
  isLoading,
  handleChange,
  handleSubmit,
  t,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form
      className="w-full space-y-6"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <div>
        <input
          name="fullName"
          placeholder={t("register.fullNamePlaceholder", "Full Name")}
          value={formData.fullName}
          onChange={handleChange}
          className={`block w-full px-4 py-3 bg-white border-b-2 ${
            errors.fullName ? "border-red-400" : "border-gray-500"
          } text-base rounded-t-md focus:outline-none focus:border-black transition placeholder-gray-400`}
          required
        />
        {errors.fullName && (
          <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
        )}
      </div>
      <div>
        <input
          name="email"
          type="email"
          placeholder={t("register.emailPlaceholder", "Email")}
          value={formData.email}
          onChange={handleChange}
          className={`block w-full px-4 py-3 bg-white border-b-2 ${
            errors.email ? "border-red-400" : "border-gray-500"
          } text-base rounded-t-md focus:outline-none focus:border-black transition placeholder-gray-400`}
          required
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email}</p>
        )}
      </div>
      <div className="relative">
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder={t("register.passwordPlaceholder", "Password")}
          value={formData.password}
          onChange={handleChange}
          className={`block w-full px-4 py-3 bg-white border-b-2 ${
            errors.password ? "border-red-400" : "border-gray-500"
          } text-base rounded-t-md focus:outline-none focus:border-black transition placeholder-gray-400`}
          required
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password}</p>
        )}
      </div>
      <div className="relative">
        <input
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          placeholder={t(
            "register.confirmPasswordPlaceholder",
            "Confirm Password",
          )}
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`block w-full px-4 py-3 bg-white border-b-2 ${
            errors.confirmPassword ? "border-red-400" : "border-gray-500"
          } text-base rounded-t-md focus:outline-none focus:border-black transition placeholder-gray-400`}
          required
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => setShowConfirmPassword((v) => !v)}
        >
          {showConfirmPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 rounded-xl text-base font-semibold text-white bg-black transition-all
          hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 active:scale-95 ${
            isLoading ? "opacity-60 cursor-not-allowed" : ""
          }`}
      >
        {isLoading
          ? t("register.loadingButton", "Registering...")
          : t("register.registerButton", "Register")}
      </button>
    </form>
  );
}

export default RegisterForm;
