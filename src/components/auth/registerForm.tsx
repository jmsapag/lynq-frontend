import React from "react";

export interface RegisterFormData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
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
  return (
    <form
      className="w-full space-y-6"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <div>
        <input
          name="name"
          placeholder={t("register.namePlaceholder", "Name")}
          value={formData.name}
          onChange={handleChange}
          className={`block w-full px-4 py-3 bg-white border-b-2 ${
            errors.name ? "border-red-400" : "border-gray-500"
          } text-base rounded-t-md focus:outline-none focus:border-black transition placeholder-gray-400`}
          required
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>
      <div>
        <input
          name="surname"
          placeholder={t("register.surnamePlaceholder", "Surname")}
          value={formData.surname}
          onChange={handleChange}
          className={`block w-full px-4 py-3 bg-white border-b-2 ${
            errors.surname ? "border-red-400" : "border-gray-500"
          } text-base rounded-t-md focus:outline-none focus:border-black transition placeholder-gray-400`}
          required
        />
        {errors.surname && (
          <p className="mt-1 text-xs text-red-500">{errors.surname}</p>
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
      <div>
        <input
          name="phone"
          placeholder={t("register.phonePlaceholder", "Phone")}
          value={formData.phone}
          onChange={handleChange}
          className={`block w-full px-4 py-3 bg-white border-b-2 ${
            errors.phone ? "border-red-400" : "border-gray-500"
          } text-base rounded-t-md focus:outline-none focus:border-black transition placeholder-gray-400`}
          required
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
        )}
      </div>
      <div>
        <input
          name="password"
          type="password"
          placeholder={t("register.passwordPlaceholder", "Password")}
          value={formData.password}
          onChange={handleChange}
          className={`block w-full px-4 py-3 bg-white border-b-2 ${
            errors.password ? "border-red-400" : "border-gray-500"
          } text-base rounded-t-md focus:outline-none focus:border-black transition placeholder-gray-400`}
          required
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password}</p>
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
