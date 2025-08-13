import React from "react";
import { LayoutType, LayoutSchema } from "./types";
import { LAYOUT_SCHEMAS } from "./schemas";

interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  className?: string;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  onLayoutChange,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Seleccionar Layout</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(LAYOUT_SCHEMAS).map((schema: LayoutSchema) => (
          <button
            key={schema.id}
            onClick={() => onLayoutChange(schema.id)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${
                currentLayout === schema.id
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }
            `}
          >
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">{schema.preview}</span>
              <h4 className="font-medium text-sm">{schema.name}</h4>
            </div>

            <p className="text-xs text-gray-600 mb-3">{schema.description}</p>

            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">Zonas:</p>
              {schema.zones.map((zone) => (
                <div
                  key={zone.id}
                  className="text-xs text-gray-500 flex items-center justify-between"
                >
                  <span>{zone.name}</span>
                  <span className="text-xs bg-gray-100 px-1 rounded">
                    {zone.acceptedTypes?.length || 0} tipos
                  </span>
                </div>
              ))}
            </div>

            {currentLayout === schema.id && (
              <div className="mt-2 text-xs text-blue-600 font-medium">
                ✓ Layout Activo
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
