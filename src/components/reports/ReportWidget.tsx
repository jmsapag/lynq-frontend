import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ReportWidgetType } from "../../types/reportLayout";

interface ReportWidgetProps {
  id: string;
  type: ReportWidgetType;
  title: string;
  category: "metric" | "chart";
  children: React.ReactNode;
  isDragging?: boolean;
  enableDrag?: boolean;
  isPlaced?: boolean;
}

export const ReportWidget: React.FC<ReportWidgetProps> = ({
  type,
  title,
  category,
  children,
  isDragging = false,
  enableDrag = true,
  isPlaced = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isCurrentlyDragging,
  } = useDraggable({
    id: type,
    disabled: !enableDrag,
    data: {
      type: type,
      category: category,
      title: title,
    },
  });

  const style = {
    // Completely disable transform for non-draggable widgets
    transform:
      enableDrag && isCurrentlyDragging
        ? CSS.Translate.toString(transform)
        : "none",
    opacity: 1,
    cursor: enableDrag
      ? isCurrentlyDragging
        ? "grabbing"
        : "grab"
      : "default",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(enableDrag ? listeners : {})}
      {...(enableDrag ? attributes : {})}
      className={`${
        enableDrag && (isDragging || isCurrentlyDragging)
          ? "scale-105 shadow-lg border-2 border-blue-500"
          : enableDrag
            ? "hover:shadow-md"
            : ""
      } ${isPlaced ? "opacity-75" : ""}`}
    >
      {children}
    </div>
  );
};
