import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

interface DroppableProps {
  children: React.ReactNode;
  id: string;
  acceptedTypes?: ("small-card" | "card" | "chart-card")[];
}

export default function Droppable({
  children,
  id,
  acceptedTypes = ["small-card", "card", "chart-card"],
}: DroppableProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: id,
    data: {
      accepts: acceptedTypes,
    },
  });

  // Check if the currently dragged item is accepted by this drop zone
  const draggedItemType = active?.data?.current?.type;
  const isAccepted = draggedItemType
    ? acceptedTypes.includes(draggedItemType)
    : true;

  // Determine the visual state
  const getDropZoneStyles = () => {
    if (!isOver) {
      return "border border-gray-200 bg-white";
    }

    if (isAccepted) {
      return "border-2 border-dashed border-blue-400 bg-blue-50";
    } else {
      return "border-2 border-dashed border-red-400 bg-red-50";
    }
  };

  // Get the icon to display as background
  const getDropZoneIcon = () => {
    if (!isOver) return null;

    if (isAccepted) {
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <CheckIcon className="w-16 h-16 text-green-500" />
        </div>
      );
    } else {
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <XMarkIcon className="w-16 h-16 text-red-500" />
        </div>
      );
    }
  };
  return (
    <div
      ref={setNodeRef}
      className={`h-min-64 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 relative ${getDropZoneStyles()}`}
    >
      {getDropZoneIcon()}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
