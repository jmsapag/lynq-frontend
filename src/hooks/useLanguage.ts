import { useTranslation } from "react-i18next";
import { useCallback } from "react";

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = useCallback(() => {
    const newLang = i18n.language === "en" ? "es" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
  }, [i18n]);

  const getCurrentLanguage = useCallback(() => {
    return i18n.language;
  }, [i18n]);

  return {
    toggleLanguage,
    getCurrentLanguage,
    currentLanguage: i18n.language,
  };
};
