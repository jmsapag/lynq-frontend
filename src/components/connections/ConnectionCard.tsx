import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
} from "@heroui/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Connection } from "../../types/connection";

interface ConnectionCardProps {
  connection: Connection;
  onEdit: (connection: Connection) => void;
  onDelete: (connection: Connection) => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  onEdit,
  onDelete,
}) => {

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger edit if clicking the delete button
    if ((e.target as HTMLElement).closest('[data-delete-button]')) {
      return;
    }
    onEdit(connection);
  };

  const handleDeleteClick = () => {
    onDelete(connection);
  };

  return (
    <Card 
      className="relative cursor-pointer hover:shadow-lg transition-shadow duration-200 h-64"
      onClick={handleCardClick}
      isPressable
    >
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 w-full items-start">
          <h4 className="text-xl font-bold text-black truncate">
            {connection.name}
          </h4>
          <h5 className="text-lg font-medium text-gray-500">
            {connection.provider}
          </h5>
        </div>
      </CardHeader>
      
      <CardBody className="pt-0">
        <div className="flex justify-between items-end h-full">
          
          <Button
            isIconOnly
            color="danger"
            variant="solid"
            radius="sm"
            onPress={handleDeleteClick}
            data-delete-button
            className="absolute bottom-4 right-4 min-w-6 w-9 h-9 p-1 shadow-md"
          >
            <TrashIcon className="h-full w-full" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default ConnectionCard;
