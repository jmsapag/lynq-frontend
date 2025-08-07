import { LayoutSchema } from './types';

export const LAYOUT_SCHEMAS: Record<string, LayoutSchema> = {
  grid: {
    id: 'grid',
    name: 'Grid Layout',
    description: 'Distribución en cuadrícula 2x2 para contenido balanceado',
    preview: '⊞',
    containerClass: 'grid grid-cols-2 gap-6 h-full',
    zones: [
      {
        id: 'grid-top-left',
        name: 'Zona Superior Izquierda',
        acceptedTypes: ['small-card', 'card'],
        className: 'min-h-[300px]'
      },
      {
        id: 'grid-top-right',
        name: 'Zona Superior Derecha',
        acceptedTypes: ['small-card', 'card'],
        className: 'min-h-[300px]'
      },
      {
        id: 'grid-bottom-left',
        name: 'Zona Inferior Izquierda',
        acceptedTypes: ['chart-card', 'card'],
        className: 'min-h-[300px]'
      },
      {
        id: 'grid-bottom-right',
        name: 'Zona Inferior Derecha',
        acceptedTypes: ['chart-card', 'card'],
        className: 'min-h-[300px]'
      }
    ]
  },
  columns: {
    id: 'columns',
    name: 'Columnas Layout',
    description: 'Tres columnas verticales para organización lineal',
    preview: '⫽',
    containerClass: 'grid grid-cols-3 gap-4 h-full',
    zones: [
      {
        id: 'col-left',
        name: 'Columna Izquierda',
        acceptedTypes: ['small-card'],
        className: 'min-h-[400px]'
      },
      {
        id: 'col-center',
        name: 'Columna Central',
        acceptedTypes: ['card', 'chart-card'],
        className: 'min-h-[400px]'
      },
      {
        id: 'col-right',
        name: 'Columna Derecha',
        acceptedTypes: ['small-card'],
        className: 'min-h-[400px]'
      }
    ]
  },
  rows: {
    id: 'rows',
    name: 'Filas Layout',
    description: 'Tres filas horizontales para contenido apilado',
    preview: '☰',
    containerClass: 'flex flex-col gap-4 h-full',
    zones: [
      {
        id: 'row-top',
        name: 'Fila Superior',
        acceptedTypes: ['small-card', 'card'],
        className: 'flex-1 min-h-[150px]'
      },
      {
        id: 'row-middle',
        name: 'Fila Central',
        acceptedTypes: ['chart-card', 'card'],
        className: 'flex-1 min-h-[200px]'
      },
      {
        id: 'row-bottom',
        name: 'Fila Inferior',
        acceptedTypes: ['small-card', 'card'],
        className: 'flex-1 min-h-[150px]'
      }
    ]
  },
  sidebar: {
    id: 'sidebar',
    name: 'Sidebar Layout',
    description: 'Barra lateral con área principal para contenido destacado',
    preview: '▣',
    containerClass: 'grid grid-cols-4 gap-6 h-full',
    zones: [
      {
        id: 'sidebar-left',
        name: 'Barra Lateral',
        acceptedTypes: ['small-card'],
        className: 'col-span-1 min-h-[500px]'
      },
      {
        id: 'main-content',
        name: 'Contenido Principal',
        acceptedTypes: ['chart-card', 'card'],
        className: 'col-span-3 min-h-[500px]'
      }
    ]
  },
  dashboard: {
    id: 'dashboard',
    name: 'LYNQ Dashboard Layout',
    description: 'Layout que replica exactamente el dashboard actual de LYNQ',
    preview: '⊟',
    containerClass: 'space-y-6',
    zones: [
      {
        id: 'metrics-row',
        name: 'Fila de Métricas',
        acceptedTypes: ['small-card'],
        className: 'grid grid-cols-1 md:grid-cols-3 gap-4'
      },
      {
        id: 'charts-column',
        name: 'Columna de Gráficos',
        acceptedTypes: ['chart-card'],
        className: 'grid grid-cols-1 gap-6'
      }
    ]
  }
};
