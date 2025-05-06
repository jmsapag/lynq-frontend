import { Tab } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface User {
  name: string;
  email: string;
  phone: string;
  role: string;
  business: string;
}

const currentUser: User = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 234 567 890",
  role: "Administrator",
  business: "ACME Inc.",
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function UserProfile() {
  const { t } = useTranslation();

  const handleEdit = () => {
    console.log("Edit action triggered");
  };

  const handleDelete = () => {
    console.log("Delete action triggered");
  };

  return (
    <div className="w-full px-2 pb-4 sm:px-0">
      <Tab.Group>
        <Tab.List className="flex border-b border-gray-300">
          <Tab
            className={({ selected }) =>
              classNames(
                "w-full py-2.5 text-sm font-medium leading-5 text-gray-700",
                "focus:outline-none",
                selected
                  ? "border-b-2 border-gray-600 font-semibold text-gray-800"
                  : "hover:font-semibold hover:text-gray-900",
              )
            }
          >
            {t("users.profile")}
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                "w-full py-2.5 text-sm font-medium leading-5 text-gray-700",
                "focus:outline-none",
                selected
                  ? "border-b-2 border-gray-600 font-semibold text-gray-800"
                  : "hover:font-semibold hover:text-gray-900",
              )
            }
          >
            {t("users.addUser")}
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-4">
          <Tab.Panel
            className={classNames(
              "bg-white p-3 rounded-md",
              "focus:outline-none",
            )}
          >
            <div className="bg-white border border-gray-300 p-4 sm:p-6 rounded-md shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-black">
                    {currentUser.name}
                  </h3>
                  <div className="mt-2">
                    <span className="inline-block bg-gray-600 text-white text-xs px-2 py-0.5 rounded-md font-medium tracking-wide">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleEdit}
                    title={t("users.edit") || "Edit"}
                    className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 rounded-md"
                  >
                    <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">{t("users.edit")}</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    title={t("users.delete") || "Delete"}
                    className="p-2 text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 rounded-md"
                  >
                    <TrashIcon className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">{t("users.delete")}</span>
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-black">
                  {t("users.contactInformation")}
                </h4>
                <div className="mt-3 space-y-2">
                  <div>
                    <span className="text-xs font-medium">
                      {t("users.email")}:
                    </span>
                    <p className="text-sm text-gray-700">{currentUser.email}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium">
                      {t("users.phone")}:
                    </span>
                    <p className="text-sm text-gray-700">{currentUser.phone}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-black">
                  {t("users.business")}
                </h4>
                <p className="text-sm text-gray-700 mt-1">
                  {currentUser.business}
                </p>
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel
            className={classNames(
              "bg-white p-3 rounded-md",
              "focus:outline-none", // Also ensure panel has no unwanted focus ring
            )}
          >
            <div className="py-10 text-center text-gray-600">
              {t("users.addUserContentComingSoon")}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
