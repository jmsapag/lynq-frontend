import { useState } from "react";

export function LoginForm({
  formData,
  errors,
  isLoading,
  handleChange,
  handleSubmit,
  t,
}: any) {
  const [showPassword, setShowPassword] = useState(false);

  return (
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
          value={formData.email}
          onChange={handleChange}
          className={`block w-full px-4 py-3 bg-white border-b-2 ${
            errors.email ? "border-red-400" : "border-gray-500"
          } text-base rounded-t-md focus:outline-none focus:border-black transition placeholder-gray-400`}
          placeholder={t("login.emailPlaceholder")}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email}</p>
        )}
      </div>
      <div className="relative">
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          className={`block w-full px-4 py-3 bg-white border-b-2 ${
            errors.password ? "border-red-400" : "border-gray-500"
          } text-base rounded-t-md focus:outline-none focus:border-black transition placeholder-gray-400`}
          placeholder={t("login.passwordPlaceholder")}
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
            // Eye-off icon
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
            // Eye icon
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
      <div className="flex justify-end items-center">
        <a
          href="#"
          className="text-sm text-[#00A5B1] hover:underline transition"
        >
          {t("login.forgot")}
        </a>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 rounded-xl text-base font-semibold text-white bg-black transition-all
        hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 active:scale-95 ${
          isLoading ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? (
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
            {t("login.loginButton")}
          </span>
        ) : (
          t("login.loginButton")
        )}
      </button>
    </form>
  );
}
