export type LayoutType = 'grid' | 'columns' | 'rows' | 'sidebar' | 'dashboard';

export interface LayoutZone {
  id: string;
  name: string;
  acceptedTypes?: ('small-card' | 'card' | 'chart-card')[];
  className?: string;
}

export interface LayoutSchema {
  id: LayoutType;
  name: string;
  description: string;
  zones: LayoutZone[];
  containerClass: string;
  preview: string; // emoji or icon for preview
}

export interface DroppedItems {
  [zoneId: string]: string[];
}

export interface WidgetItem {
  id: string;
  type: 'small-card' | 'card' | 'chart-card';
  content: {
    icon: string;
    title: string;
    description?: string;
    data?: any;
  };
}
