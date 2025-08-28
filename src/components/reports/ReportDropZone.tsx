import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface ReportDropZoneProps {
  id: string;
  type: "metric" | "chart" | "any";
  isEmpty: boolean;
  className?: string;
  title?: string;
  children?: React.ReactNode;
}

export const ReportDropZone: React.FC<ReportDropZoneProps> = ({
  id,
  type,
  isEmpty,
  className = "",
  title,
  children,
}) => {
  const { isOver, setNodeRef, active } = useDroppable({
    id,
  });

  // Get the dragged item category from the active drag data
  const draggedItemType = active?.data?.current?.category;

  // Determine if this zone can accept the dragged item
  const canAccept =
    !draggedItemType || type === "any" || draggedItemType === type;

  const isDraggedOver = isOver && canAccept;
  const isInvalidDrop = isOver && !canAccept;

  return (
    <div
      ref={setNodeRef}
      className={[
        "relative border-2 border-dashed rounded-lg transition-all duration-200",
        isEmpty
          ? "flex items-center justify-center min-h-[120px]"
          : "border-transparent bg-transparent",
        isDraggedOver && canAccept
          ? isEmpty
            ? "border-green-500 bg-green-50"
            : "border-green-500 bg-green-50 shadow-lg shadow-green-200/50 scale-[1.02] z-10"
          : isInvalidDrop
            ? "border-red-500 bg-red-50"
            : isEmpty
              ? "border-gray-300 bg-gray-50 hover:border-gray-400"
              : "",
        // Add extra styling for occupied zones being hovered
        !isEmpty && isDraggedOver && canAccept
          ? "ring-4 ring-green-300/50 ring-offset-2"
          : "",
        className,
      ].join(" ")}
      style={{
        // Ensure the hover effect is visible above other elements
        zIndex: isDraggedOver && canAccept && !isEmpty ? 20 : "auto",
      }}
    >
      {isEmpty && (
        <div className="text-center p-4">
          <div className="text-gray-500 text-sm font-medium">
            {title ||
              `Drop ${type === "metric" ? "metric card" : type === "chart" ? "chart widget" : "widget"} here`}
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {type === "metric"
              ? "Metric widgets display key statistics"
              : type === "chart"
                ? "Chart widgets show visual data representations"
                : "Any widget type accepted"}
          </div>
        </div>
      )}
      {!isEmpty && (
        <div className="w-full relative">
          {/* Overlay for drag feedback on occupied zones */}
          {isDraggedOver && canAccept && (
            <div className="absolute inset-0 border-2 border-green-500 bg-green-100/30 rounded-lg pointer-events-none z-10 animate-pulse" />
          )}
          {isInvalidDrop && (
            <div className="absolute inset-0 border-2 border-red-500 bg-red-100/30 rounded-lg pointer-events-none z-10" />
          )}
          {children}
        </div>
      )}
    </div>
  );
};
