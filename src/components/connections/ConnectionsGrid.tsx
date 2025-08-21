import React from "react";
import { useTranslation } from "react-i18next";
import { Connection } from "../../types/connection";
import ConnectionCard from "./ConnectionCard";
import { Spinner } from "@heroui/react";

interface ConnectionsGridProps {
  connections: Connection[];
  loading: boolean;
  onEdit: (connection: Connection) => void;
  onDelete: (connection: Connection) => void;
}

const ConnectionsGrid: React.FC<ConnectionsGridProps> = ({
  connections,
  loading,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {t("connections.noConnections", "No connections found")}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {t(
            "connections.getStarted",
            "Get started by creating a new connection.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {connections.map((connection) => (
        <ConnectionCard
          key={connection.id}
          connection={connection}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ConnectionsGrid;
