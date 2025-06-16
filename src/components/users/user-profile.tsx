import { PencilSquareIcon } from "@heroicons/react/24/outline";

interface User {
  name: string;
  email: string;
  phone: string;
  role: string;
  business: string;
}

interface UserProfileProps {
  user: User;
  onEdit: () => void;
  t: (key: string) => string;
}

export default function UserProfile({ user, onEdit, t }: UserProfileProps) {
  return (
    <div className="w-full px-2 pb-4 sm:px-0">
      <div className="bg-white border border-gray-300 p-4 sm:p-6 rounded-md shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-black">{user.name}</h3>
            <div className="mt-2">
              <span className="inline-block bg-gray-600 text-white text-xs px-2 py-0.5 rounded-md font-medium tracking-wide">
                {user.role}
              </span>
            </div>
          </div>
          <div>
            <button
              onClick={onEdit}
              title={t("users.edit") || "Edit"}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 rounded-md"
            >
              <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">{t("users.edit")}</span>
            </button>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-black">
            {t("users.contactInformation")}
          </h4>
          <div className="mt-3 space-y-2">
            <div>
              <span className="text-xs font-medium">{t("users.email")}:</span>
              <p className="text-sm text-gray-700">{user.email}</p>
            </div>
            <div>
              <span className="text-xs font-medium">{t("users.phone")}:</span>
              <p className="text-sm text-gray-700">{user.phone}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-black">
            {t("users.business")}
          </h4>
          <p className="text-sm text-gray-700 mt-1">{user.business}</p>
        </div>
      </div>
    </div>
  );
}
