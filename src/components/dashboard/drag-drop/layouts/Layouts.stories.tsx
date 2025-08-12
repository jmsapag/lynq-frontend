import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LayoutEditor, LayoutViewer, LayoutSelector } from './index';
import { LayoutType, DroppedItems } from './types';

// Demo con datos de ejemplo
const SAMPLE_LAYOUT_DATA: DroppedItems = {
  'grid-top-left': ['analytics-1', 'users-1'],
  'grid-top-right': ['notifications'],
  'grid-bottom-left': ['revenue-chart'],
  'grid-bottom-right': ['tasks-card']
};

const LayoutDemo = () => {
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('grid');
  const [layoutData, setLayoutData] = useState<DroppedItems>(SAMPLE_LAYOUT_DATA);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleSave = (layout: LayoutType, items: DroppedItems) => {
    setCurrentLayout(layout);
    setLayoutData(items);
    setIsEditMode(false);
  };

  if (isEditMode) {
    return (
      <LayoutEditor
        initialLayout={currentLayout}
        initialItems={layoutData}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Control de modo */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Dashboard Demo</h1>
          <button
            onClick={() => setIsEditMode(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Editar Layout
          </button>
        </div>
      </div>

      <LayoutViewer
        layout={currentLayout}
        items={layoutData}
      />
    </div>
  );
};

const meta: Meta = {
  title: 'Dashboard/Layouts/Complete System',
  component: LayoutDemo,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia principal con todo el sistema
export const FullLayoutSystem: Story = {
  render: () => <LayoutDemo />,
};

// Editor individual
export const EditorOnly: Story = {
  render: () => (
    <LayoutEditor
      initialLayout="grid"
      initialItems={SAMPLE_LAYOUT_DATA}
      onSave={(layout, items) => console.log('Saved:', layout, items)}
    />
  ),
};

// Viewer individual
export const ViewerOnly: Story = {
  render: () => (
    <LayoutViewer
      layout="dashboard"
      items={{
        'dash-header': ['analytics-1'],
        'dash-sidebar': ['users-1', 'notifications'],
        'dash-main': ['revenue-chart', 'performance'],
        'dash-footer': ['tasks-card']
      }}
    />
  ),
};

// Selector individual
export const SelectorOnly: Story = {
  render: () => {
    const [layout, setLayout] = useState<LayoutType>('grid');
    return (
      <div className="p-8">
        <LayoutSelector
          currentLayout={layout}
          onLayoutChange={setLayout}
        />
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm">Layout seleccionado: <strong>{layout}</strong></p>
        </div>
      </div>
    );
  },
};

// Comparación de todos los layouts
export const AllLayouts: Story = {
  render: () => {
    const layouts: LayoutType[] = ['grid', 'columns', 'rows', 'sidebar', 'dashboard'];
    const sampleData: DroppedItems = {
      // Grid
      'grid-top-left': ['analytics-1'],
      'grid-top-right': ['users-1'],
      'grid-bottom-left': ['revenue-chart'],
      'grid-bottom-right': ['tasks-card'],
      // Columns
      'col-left': ['analytics-1', 'users-1'],
      'col-center': ['revenue-chart'],
      'col-right': ['tasks-card'],
      // Rows
      'row-top': ['analytics-1', 'users-1'],
      'row-middle': ['revenue-chart'],
      'row-bottom': ['tasks-card'],
      // Sidebar
      'sidebar-left': ['analytics-1', 'users-1'],
      'main-content': ['revenue-chart'],
      // Dashboard
      'dash-header': ['analytics-1'],
      'dash-sidebar': ['users-1'],
      'dash-main': ['revenue-chart'],
      'dash-footer': ['tasks-card']
    };

    return (
      <div className="space-y-8 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold text-center">Todos los Layouts Disponibles</h1>
        {layouts.map(layout => (
          <div key={layout} className="bg-white rounded-lg shadow-sm border">
            <div className="h-96 overflow-hidden">
              <LayoutViewer
                layout={layout}
                items={sampleData}
              />
            </div>
          </div>
        ))}
      </div>
    );
  },
};
