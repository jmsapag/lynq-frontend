export function LoginForm({
  formData,
  errors,
  isLoading,
  handleChange,
  handleSubmit,
  setIsContactModalOpen,
  t,
}: any) {
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
      <div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          className={`block w-full px-4 py-3 bg-white border-b-2 ${
            errors.password ? "border-red-400" : "border-gray-500"
          } text-base rounded-t-md focus:outline-none focus:border-black transition placeholder-gray-400`}
          placeholder={t("login.passwordPlaceholder")}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password}</p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm text-gray-600">
          <input
            type="checkbox"
            className="h-4 w-4 accent-black border-gray-300 rounded focus:ring-black"
          />
          <span className="ml-2">{t("login.rememberMe")}</span>
        </label>
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
      <div className="mt-8 text-center text-gray-400 text-sm">
        {t("login.noAccount")}{" "}
        <button
          type="button"
          onClick={() => setIsContactModalOpen(true)}
          className="text-[#00A5B1] hover:underline focus:outline-none"
        >
          {t("login.contactUs")}
        </button>
      </div>
    </form>
  );
}
