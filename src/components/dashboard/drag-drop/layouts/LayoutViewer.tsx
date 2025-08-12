import React from 'react';
import { LayoutType, DroppedItems, WidgetItem } from './types';
import { LAYOUT_SCHEMAS } from './schemas';
import { LayoutRenderer } from './LayoutRenderer';

interface LayoutViewerProps {
  layout: LayoutType;
  items: DroppedItems;
  className?: string;
}

// Datos de ejemplo para mostrar contenido real
const SAMPLE_WIDGETS: WidgetItem[] = [
  {
    id: 'analytics-1',
    type: 'small-card',
    content: {
      icon: '📊',
      title: 'Analytics Overview',
      description: 'Métricas principales del sistema',
      data: { value: 1234, trend: '+12%' }
    }
  },
  {
    id: 'users-1',
    type: 'small-card',
    content: {
      icon: '👥',
      title: 'Usuarios Activos',
      description: 'Cantidad de usuarios en línea',
      data: { value: 89, trend: '+5%' }
    }
  },
  {
    id: 'revenue-chart',
    type: 'chart-card',
    content: {
      icon: '📈',
      title: 'Gráfico de Ingresos',
      description: 'Evolución mensual de ingresos',
      data: { chartType: 'line', period: 'monthly' }
    }
  },
  {
    id: 'tasks-card',
    type: 'card',
    content: {
      icon: '📋',
      title: 'Lista de Tareas',
      description: 'Tareas pendientes y completadas',
      data: { pending: 5, completed: 23 }
    }
  },
  {
    id: 'notifications',
    type: 'card',
    content: {
      icon: '🔔',
      title: 'Notificaciones',
      description: 'Alertas y mensajes recientes',
      data: { unread: 3 }
    }
  },
  {
    id: 'performance',
    type: 'chart-card',
    content: {
      icon: '⚡',
      title: 'Rendimiento Sistema',
      description: 'Métricas de performance en tiempo real',
      data: { cpu: 45, memory: 67, network: 23 }
    }
  }
];

export const LayoutViewer: React.FC<LayoutViewerProps> = ({
  layout,
  items,
  className = ''
}) => {
  const schema = LAYOUT_SCHEMAS[layout];
  
  if (!schema) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Layout no encontrado: {layout}</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-100 min-h-screen ${className}`}>
      {/* Header opcional para mostrar info del layout */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold flex items-center space-x-2">
              <span>{schema.preview}</span>
              <span>{schema.name}</span>
            </h1>
            <p className="text-sm text-gray-600">{schema.description}</p>
          </div>
          
          <div className="text-sm text-gray-500">
            Modo: Solo Lectura
          </div>
        </div>
      </div>

      {/* Renderizar el layout sin funcionalidad de drag & drop */}
      <div className="h-screen overflow-auto">
        <LayoutRenderer
          schema={schema}
          droppedItems={items}
          availableItems={SAMPLE_WIDGETS}
          isEditMode={false}
        />
      </div>
    </div>
  );
};
