# Reports Drag & Drop Layout System

## Overview

The Reports section provides a flexible drag-and-drop interface that allows users to create customizable report layouts by arranging widgets (metrics and charts) in predefined layout structures. This system enables users to design personalized dashboards that can be saved and automatically restored when switching between different layout configurations.

## Key Features

- **Drag & Drop Interface**: Intuitive widget placement with visual feedback
- **Multiple Layout Types**: Pre-defined layouts (Default, Metrics Grid, Compact) + custom layouts
- **Auto-Save/Load**: Widget placements are automatically saved per layout and restored when switching
- **Edit/View Modes**: Toggle between editing and viewing configurations
- **Real-time Preview**: See changes immediately as widgets are placed
- **API Integration**: Seamless backend integration with localStorage fallback

## Architecture

### Core Components

#### 1. ReportDragDropInterface (`src/components/reports/ReportDragDropInterface.tsx`)
- **Purpose**: Main container component orchestrating the entire drag-and-drop experience
- **Responsibilities**:
  - Layout selection and management
  - Edit/view mode toggling
  - Widget placement coordination
  - Save/load functionality
  - Integration with backend services

#### 2. ReportLayoutService (`src/services/reportLayoutService.ts`)
- **Purpose**: Service layer handling layout configurations and widget placements
- **Responsibilities**:
  - CRUD operations for layout configurations
  - API communication with backend
  - localStorage fallback for offline functionality
  - Widget placement persistence

#### 3. useReportLayout Hook (`src/hooks/reports/useReportLayout.ts`)
- **Purpose**: React hook managing layout state and drag-and-drop logic
- **Responsibilities**:
  - Layout state management
  - Drag-and-drop event handling
  - Widget placement state
  - Layout switching logic

## Data Models

### Layout Configuration
```typescript
interface ReportLayoutConfig {
  id: string;                    // Unique layout identifier
  name: string;                  // Display name
  description: string;           // Layout description
  isCustom: boolean;            // Whether it's user-created
  sections: LayoutSection[];     // Layout structure
  widgetPlacements: ReportWidgetPlacements; // Default widget positions
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
  };
}
```

### Widget Placements
```typescript
interface ReportWidgetPlacements {
  [zoneId: string]: ReportWidgetType | null;
}

// Example:
{
  "metric-1": "total-in",
  "metric-2": "total-out", 
  "metric-3": "entry-rate",
  "chart-1": "people-flow-chart",
  "chart-2": null  // Empty zone
}
```

### Layout Structure
```typescript
interface LayoutSection {
  id: string;                    // Section identifier
  className: string;             // CSS classes for styling
  zones: DropZone[];            // Available drop zones
}

interface DropZone {
  id: string;                    // Zone identifier
  type: "metric" | "chart" | "any"; // Accepted widget types
  title?: string;                // Display title
}
```

## User Workflow

### 1. Layout Selection
Users can select from available layouts via dropdown:
- **Default Layout**: 3 metrics + 3 charts in grid
- **Metrics Grid**: 4x2 grid focused on metrics
- **Compact View**: 2 metrics + 1 chart
- **Custom Layouts**: User-created configurations

### 2. Edit Mode
Toggle edit mode to enable:
- Widget sidebar with available components
- Drag-and-drop functionality
- Zone highlighting and visual feedback
- Save button visibility

### 3. Widget Placement
- Drag widgets from sidebar to drop zones
- Visual feedback shows compatible zones
- Incompatible zones are disabled
- Widgets can be moved between zones
- Drag to removal zone to delete placement

### 4. Auto-Save
- Widget placements are automatically saved per layout
- Switching layouts preserves individual configurations
- Changes persist across browser sessions

## Widget Types

### Metrics Widgets
- `total-in`: Total entry count
- `total-out`: Total exit count  
- `entry-rate`: Entry rate percentage
- `daily-average-in`: Daily average entries
- `daily-average-out`: Daily average exits
- `most-crowded-day`: Peak day information
- `least-crowded-day`: Lowest activity day
- `percentage-change`: Change percentage
- `returning-customers`: Return visitor count
- `avg-visit-duration`: Average visit time
- `affluence`: Affluence metric

### Chart Widgets
- `people-flow-chart`: Traffic flow visualization
- `traffic-heatmap`: Activity heatmap
- `entry-rate-chart`: Entry rate trends
- `occupancy-chart`: Occupancy levels
- `comparative-chart`: Comparison visualization
- `cumulative-chart`: Cumulative data trends

## API Endpoints

### Layout Placements Management

#### Save Widget Placements
```http
POST /api/reports/layouts/placements
Content-Type: application/json

{
  "layoutId": "default",
  "widgetPlacements": {
    "metric-1": "total-in",
    "metric-2": "total-out",
    "metric-3": "entry-rate",
    "chart-1": "people-flow-chart",
    "chart-2": null,
    "chart-3": null
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Widget placements saved successfully",
  "layoutId": "default",
  "timestamp": "2025-08-27T10:30:00Z"
}
```

#### Load Widget Placements
```http
GET /api/reports/layouts/placements/{layoutId}
```

**Response (200 OK):**
```json
{
  "layoutId": "default",
  "widgetPlacements": {
    "metric-1": "total-in",
    "metric-2": "total-out",
    "metric-3": "entry-rate",
    "chart-1": "people-flow-chart",
    "chart-2": null,
    "chart-3": null
  },
  "lastModified": "2025-08-27T10:30:00Z"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Layout placements not found",
  "layoutId": "default"
}
```

#### Get All Saved Configurations
```http
GET /api/reports/layouts/configurations
```

**Response (200 OK):**
```json
{
  "configurations": [
    {
      "layoutId": "default",
      "widgetPlacements": { /* ... */ },
      "lastModified": "2025-08-27T10:30:00Z"
    },
    {
      "layoutId": "metrics-grid", 
      "widgetPlacements": { /* ... */ },
      "lastModified": "2025-08-27T09:15:00Z"
    }
  ]
}
```

### Error Handling

#### Common Error Responses
```json
// 400 Bad Request
{
  "error": "Invalid layout ID",
  "details": "Layout 'invalid-layout' does not exist"
}

// 500 Internal Server Error  
{
  "error": "Failed to save widget placements",
  "details": "Database connection error"
}
```

## Backend Implementation Requirements

### Database Schema

#### Layout Placements Table
```sql
CREATE TABLE report_layout_placements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  layout_id VARCHAR(100) NOT NULL,
  widget_placements JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, layout_id)
);

-- Index for faster lookups
CREATE INDEX idx_layout_placements_user_layout 
ON report_layout_placements(user_id, layout_id);
```

### API Implementation Guidelines

#### 1. Authentication & Authorization
- All endpoints require valid JWT authentication
- Users can only access their own layout configurations
- Admin users can access all configurations (if needed)

#### 2. Data Validation
```typescript
// Widget placement validation
interface WidgetPlacementRequest {
  layoutId: string;           // Required, must be valid layout ID
  widgetPlacements: {         // Required object
    [zoneId: string]: string | null; // Widget type or null
  };
}

// Validation rules:
// - layoutId must exist in predefined layouts
// - zoneId must exist in layout's zones
// - widgetType must be valid widget type or null
// - Widget type must be compatible with zone type
```

#### 3. Business Logic
```typescript
// Save widget placements
async function saveLayoutPlacements(userId: number, request: WidgetPlacementRequest) {
  // 1. Validate layout exists
  const layout = await getLayoutById(request.layoutId);
  if (!layout) throw new Error('Invalid layout ID');
  
  // 2. Validate zones and widget types
  validateWidgetPlacements(layout, request.widgetPlacements);
  
  // 3. Upsert database record
  await upsertLayoutPlacements(userId, request.layoutId, request.widgetPlacements);
  
  // 4. Return success response
  return { success: true, layoutId: request.layoutId };
}
```

#### 4. Performance Considerations
- Use database indexes for user_id + layout_id lookups
- Cache frequently accessed layout definitions
- Implement request rate limiting
- Use JSONB for efficient widget placement storage

#### 5. Fallback Handling
The frontend implements localStorage fallback, so the backend should:
- Return appropriate HTTP status codes
- Handle partial failures gracefully
- Provide clear error messages
- Support bulk operations for sync scenarios

## Testing Guidelines

### Frontend Testing
```typescript
// Test layout switching
it('should load saved placements when switching layouts', async () => {
  const { result } = renderHook(() => useReportLayout());
  
  // Mock saved placements
  mockLayoutService.loadLayoutPlacements.mockResolvedValue({
    'metric-1': 'total-in',
    'chart-1': 'people-flow-chart'
  });
  
  // Switch layout
  await act(async () => {
    await result.current.setCurrentLayout('default');
  });
  
  // Verify placements loaded
  expect(result.current.widgetPlacements).toEqual({
    'metric-1': 'total-in',
    'chart-1': 'people-flow-chart'
  });
});
```

### Backend Testing
```typescript
// Test save endpoint
describe('POST /api/reports/layouts/placements', () => {
  it('should save valid widget placements', async () => {
    const response = await request(app)
      .post('/api/reports/layouts/placements')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        layoutId: 'default',
        widgetPlacements: {
          'metric-1': 'total-in',
          'chart-1': 'people-flow-chart'
        }
      });
      
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## Migration & Deployment

### Existing Data Migration
If upgrading from a previous system:
```sql
-- Migrate existing configurations to new format
INSERT INTO report_layout_placements (user_id, layout_id, widget_placements)
SELECT 
  user_id,
  'default' as layout_id,
  JSON_BUILD_OBJECT(
    'metric-1', 'total-in',
    'metric-2', 'total-out',
    'chart-1', 'people-flow-chart'
  ) as widget_placements
FROM legacy_report_configs;
```

### Feature Flags
Consider implementing feature flags for:
- New layout types
- Advanced widget configurations  
- Experimental features
- A/B testing different UI approaches

## Future Enhancements

### Planned Features
1. **Custom Layout Builder**: Allow users to create entirely custom layouts
2. **Widget Configuration**: Per-widget settings and customization
3. **Template Sharing**: Share layout templates between users
4. **Export/Import**: Backup and restore layout configurations
5. **Analytics**: Track layout usage and optimization suggestions

### Technical Improvements
1. **Real-time Collaboration**: Multiple users editing same layout
2. **Version History**: Track changes over time
3. **Performance Optimization**: Virtual scrolling for large layouts
4. **Mobile Support**: Touch-friendly drag-and-drop
5. **Accessibility**: Screen reader and keyboard navigation support

This documentation provides a comprehensive guide for both frontend developers working with the system and backend developers implementing the supporting API endpoints.
