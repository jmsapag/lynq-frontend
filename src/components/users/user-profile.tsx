import { PencilSquareIcon } from "@heroicons/react/24/outline";

interface Business {
  id: number;
  name: string;
  address: string;
  created_at?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  business_id: number;
  is_active?: boolean;
  business: Business;
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
            <div className="mt-2 flex gap-2 items-center">
              <span className="inline-block bg-gray-600 text-white text-xs px-2 py-0.5 rounded-md font-medium tracking-wide min-w-[64px] text-center">
                {user.role}
              </span>
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded-md font-medium min-w-[64px] text-center ${
                  user.is_active === undefined
                    ? "bg-gray-100 text-gray-700"
                    : user.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {user.is_active === undefined
                  ? t("users.unknown") || "Unknown"
                  : user.is_active
                    ? t("users.active") || "Active"
                    : t("users.inactive") || "Inactive"}
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

        {/* Contact Information */}
        <div className="mt-5 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-black mb-3">
            {t("users.contactInformation")}
          </h4>
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-gray-600">
                {t("users.email")}:
              </span>
              <span className="ml-2 text-sm text-gray-700">{user.email}</span>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-600">
                {t("users.phone")}:
              </span>
              <span className="ml-2 text-sm text-gray-700">{user.phone}</span>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-600">
                {t("users.createdAt") || "Created"}:
              </span>
              <span className="ml-2 text-sm text-gray-700">
                {new Date(user.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="mt-5 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-black mb-3">
            {t("users.business")}
          </h4>
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-gray-600">
                {t("users.businessName") || "Business Name"}:
              </span>
              <span className="ml-2 text-sm text-gray-700">
                {user.business?.name}
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-600">
                {t("users.businessLocation") || "Business Location"}:
              </span>
              <span className="ml-2 text-sm text-gray-700">
                {user.business?.address}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
