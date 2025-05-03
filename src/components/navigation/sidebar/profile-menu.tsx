import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { LanguageIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../../hooks/useLanguage.ts";

interface ProfileMenuProps {
  onLogout: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguage();

  const handleLanguageToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLanguage();
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <Menu as="div" className="relative flex-1">
        <Menu.Button className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400 transition-colors">
          <div className="h-9 w-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700 shrink-0">
            JD
          </div>
          <div className="flex flex-col items-start overflow-hidden">
            <span className="text-sm font-medium text-gray-900 truncate">
              John Doe
            </span>
            <span className="text-xs text-gray-500 truncate">
              {t("role.admin")}
            </span>
          </div>
        </Menu.Button>

        <MenuTransition>
          <Menu.Items className="absolute bottom-full left-0 mb-2 w-full origin-bottom-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onLogout}
                  className={`${
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                  } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                >
                  {t("logout")}
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </MenuTransition>
      </Menu>

      <button
        onClick={handleLanguageToggle}
        title={t("common.changeLanguage")}
        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 flex items-center gap-2"
      >
        <LanguageIcon className="h-5 w-5" />
        <span className="text-xs font-medium">
          {currentLanguage.toUpperCase()}
        </span>
      </button>
    </div>
  );
};

const MenuTransition = ({ children }: { children: React.ReactNode }) => (
  <Transition
    as={Fragment}
    enter="transition ease-out duration-100"
    enterFrom="transform opacity-0 scale-95"
    enterTo="transform opacity-100 scale-100"
    leave="transition ease-in duration-75"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-95"
  >
    {children}
  </Transition>
);
