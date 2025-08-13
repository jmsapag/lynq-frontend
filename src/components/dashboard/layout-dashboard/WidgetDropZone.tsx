// src/components/dashboard/layout-dashboard/WidgetDropZone.tsx
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { PlusIcon } from "@heroicons/react/24/outline";

interface WidgetDropZoneProps {
  id: string;
  acceptedTypes: ("metric" | "chart")[];
  children?: React.ReactNode;
  isEmpty?: boolean;
  zoneTitle?: string;
  className?: string;
}

export const WidgetDropZone: React.FC<WidgetDropZoneProps> = ({
  id,
  acceptedTypes,
  children,
  isEmpty = false,
  zoneTitle,
  className = "",
}) => {
  const { setNodeRef, isOver, active } = useDroppable({
    id: id,
    data: {
      accepts: acceptedTypes,
    },
  });

  // Check if the currently dragged item is accepted by this drop zone
  const draggedItemType = active?.data?.current?.type;
  const isAccepted = draggedItemType
    ? acceptedTypes.includes(draggedItemType as any)
    : true;

  // Determine the visual state
  const getDropZoneStyles = () => {
    if (isEmpty && !isOver) {
      return "border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100";
    }

    if (!isOver) {
      return "border border-gray-200 bg-white";
    }

    if (isAccepted) {
      return "border-2 border-dashed border-blue-400 bg-blue-50";
    } else {
      return "border-2 border-dashed border-red-400 bg-red-50";
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        ${getDropZoneStyles()}
        rounded-lg transition-all duration-200 min-h-[120px] relative flex flex-col
        ${className}
      `}
    >
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <PlusIcon
            className={`w-8 h-8 mb-2 ${
              isOver && isAccepted
                ? "text-blue-600"
                : isOver && !isAccepted
                  ? "text-red-600"
                  : "text-gray-400"
            }`}
          />
          <p
            className={`text-sm font-medium ${
              isOver && isAccepted
                ? "text-blue-600"
                : isOver && !isAccepted
                  ? "text-red-600"
                  : "text-gray-500"
            }`}
          >
            {isOver && !isAccepted
              ? "Widget not compatible"
              : zoneTitle || "Drop widget here"}
          </p>
          {!isOver && (
            <p className="text-xs text-gray-400 mt-1">
              Accepts: {acceptedTypes.join(", ")}
            </p>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col">{children}</div>
      )}

      {/* Overlay for drag feedback when occupied */}
      {!isEmpty && isOver && (
        <div
          className={`
          absolute inset-0 rounded-lg border-2 border-dashed
          ${isAccepted ? "border-blue-400 bg-blue-50 bg-opacity-50" : "border-red-400 bg-red-50 bg-opacity-50"}
          flex items-center justify-center
        `}
        >
          <p
            className={`text-sm font-medium ${
              isAccepted ? "text-blue-600" : "text-red-600"
            }`}
          >
            {isAccepted ? "Replace widget" : "Widget not compatible"}
          </p>
        </div>
      )}
    </div>
  );
};
