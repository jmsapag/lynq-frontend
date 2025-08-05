import React from 'react';
import { LayoutSchema, DroppedItems, WidgetItem } from './types';
import Droppable from '../droppable/droppable';
import Draggable from '../draggable/draggable';

interface LayoutRendererProps {
  schema: LayoutSchema;
  droppedItems: DroppedItems;
  availableItems: WidgetItem[];
  isEditMode?: boolean;
  onZoneClick?: (zoneId: string) => void;
}

export const LayoutRenderer: React.FC<LayoutRendererProps> = ({
  schema,
  droppedItems,
  availableItems,
  isEditMode = false,
  onZoneClick
}) => {
  const renderZoneContent = (zoneId: string, zoneName: string) => {
    const itemIds = droppedItems[zoneId] || [];
    
    if (itemIds.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8 h-full flex flex-col items-center justify-center">
          <p className="text-sm font-medium">{zoneName}</p>
          {isEditMode && (
            <p className="text-xs mt-1 opacity-70">Arrastra elementos aquí</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3 p-4 h-full">
        {itemIds.map(itemId => {
          const item = availableItems.find(i => i.id === itemId);
          if (!item) return null;

          if (isEditMode) {
            return (
              <Draggable key={itemId} id={item.id} type={item.type} className="w-full">
                <div>
                  <div className="text-lg">{item.content.icon}</div>
                  <div className="text-xs font-medium">{item.content.title}</div>
                </div>
              </Draggable>
            );
          }

          // Modo lectura - renderizar widget estático
          return (
            <div key={itemId} className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{item.content.icon}</span>
                <div>
                  <h4 className="font-medium text-sm">{item.content.title}</h4>
                  {item.content.description && (
                    <p className="text-xs text-gray-600">{item.content.description}</p>
                  )}
                </div>
              </div>
              {/* Aquí se renderizaría el contenido real del widget */}
              {item.content.data && (
                <div className="mt-3 text-sm text-gray-700">
                  {/* Placeholder para datos reales */}
                  <div className="h-20 bg-gray-100 rounded flex items-center justify-center">
                    Contenido del widget
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`${schema.containerClass} p-6`}>
      {schema.zones.map(zone => {
        const content = renderZoneContent(zone.id, zone.name);
        
        if (isEditMode) {
          return (
            <div key={zone.id} className={zone.className}>
              <Droppable
                id={zone.id}
                acceptedTypes={zone.acceptedTypes}
              >
                {content}
              </Droppable>
            </div>
          );
        }

        // Modo lectura - sin droppable
        return (
          <div
            key={zone.id}
            className={`${zone.className} bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 ${
              onZoneClick ? 'cursor-pointer hover:border-gray-300' : ''
            }`}
            onClick={() => onZoneClick?.(zone.id)}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
};
