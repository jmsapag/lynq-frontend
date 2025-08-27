# Reports Layout API Specification

## Overview

This document specifies the API endpoints required for the Reports Drag & Drop Layout System. The API manages widget placements for different layout configurations, allowing users to save and restore their customized report layouts.

## Base URL

```
https://api.lynq.com/v1
```

## Authentication

All endpoints require JWT authentication via the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Save Widget Placements

Save widget placements for a specific layout.

**Endpoint:** `POST /api/reports/layouts/placements`

**Request Body:**
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
  }
}
```

**Request Schema:**
```typescript
interface SavePlacementsRequest {
  layoutId: string;                           // Required: Layout identifier
  widgetPlacements: Record<string, string | null>; // Required: Zone-to-widget mapping
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Widget placements saved successfully",
  "layoutId": "default",
  "timestamp": "2025-08-27T10:30:00Z"
}
```

**Error Responses:**

*400 Bad Request - Invalid Layout:*
```json
{
  "error": "Invalid layout ID",
  "details": "Layout 'invalid-layout' does not exist",
  "code": "INVALID_LAYOUT_ID"
}
```

*400 Bad Request - Invalid Widget Placement:*
```json
{
  "error": "Invalid widget placement",
  "details": "Widget 'invalid-widget' is not compatible with zone 'metric-1'",
  "code": "INCOMPATIBLE_WIDGET_ZONE"
}
```

*500 Internal Server Error:*
```json
{
  "error": "Failed to save widget placements",
  "details": "Database connection error",
  "code": "DATABASE_ERROR"
}
```

### 2. Load Widget Placements

Retrieve saved widget placements for a specific layout.

**Endpoint:** `GET /api/reports/layouts/placements/{layoutId}`

**Path Parameters:**
- `layoutId` (string): The layout identifier

**Success Response (200 OK):**
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
  "lastModified": "2025-08-27T10:30:00Z",
  "version": "1.0"
}
```

**Error Responses:**

*404 Not Found:*
```json
{
  "error": "Layout placements not found",
  "details": "No saved placements found for layout 'custom-layout'",
  "layoutId": "custom-layout",
  "code": "PLACEMENTS_NOT_FOUND"
}
```

### 3. Get All User Configurations

Retrieve all saved layout configurations for the authenticated user.

**Endpoint:** `GET /api/reports/layouts/configurations`

**Query Parameters:**
- `include_defaults` (boolean, optional): Include default layout configurations (default: false)
- `modified_since` (ISO 8601 datetime, optional): Only return configurations modified after this date

**Success Response (200 OK):**
```json
{
  "configurations": [
    {
      "layoutId": "default",
      "widgetPlacements": {
        "metric-1": "total-in",
        "metric-2": "total-out",
        "chart-1": "people-flow-chart"
      },
      "lastModified": "2025-08-27T10:30:00Z",
      "version": "1.0"
    },
    {
      "layoutId": "metrics-grid",
      "widgetPlacements": {
        "metric-1": "entry-rate",
        "metric-2": "total-in",
        "metric-3": "daily-average-in",
        "metric-4": "percentage-change"
      },
      "lastModified": "2025-08-27T09:15:00Z",
      "version": "1.0"
    }
  ],
  "total": 2,
  "lastSync": "2025-08-27T11:00:00Z"
}
```

### 4. Delete Widget Placements

Remove saved widget placements for a specific layout.

**Endpoint:** `DELETE /api/reports/layouts/placements/{layoutId}`

**Path Parameters:**
- `layoutId` (string): The layout identifier

**Success Response (204 No Content):**
```
(Empty response body)
```

**Error Responses:**

*404 Not Found:*
```json
{
  "error": "Layout placements not found",
  "details": "No saved placements found for layout 'non-existent'",
  "layoutId": "non-existent",
  "code": "PLACEMENTS_NOT_FOUND"
}
```

### 5. Bulk Update Placements

Update multiple layout configurations in a single request.

**Endpoint:** `PUT /api/reports/layouts/placements/bulk`

**Request Body:**
```json
{
  "configurations": [
    {
      "layoutId": "default",
      "widgetPlacements": {
        "metric-1": "total-in",
        "chart-1": "people-flow-chart"
      }
    },
    {
      "layoutId": "metrics-grid",
      "widgetPlacements": {
        "metric-1": "entry-rate",
        "metric-2": "total-out"
      }
    }
  ]
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "updated": 2,
  "failed": 0,
  "results": [
    {
      "layoutId": "default",
      "status": "success",
      "timestamp": "2025-08-27T10:30:00Z"
    },
    {
      "layoutId": "metrics-grid", 
      "status": "success",
      "timestamp": "2025-08-27T10:30:01Z"
    }
  ]
}
```

## Data Models

### Widget Types (Enums)

**Metric Widgets:**
```typescript
type MetricWidgetType = 
  | "total-in"
  | "total-out" 
  | "entry-rate"
  | "daily-average-in"
  | "daily-average-out"
  | "most-crowded-day"
  | "least-crowded-day"
  | "percentage-change"
  | "returning-customers"
  | "avg-visit-duration"
  | "affluence";
```

**Chart Widgets:**
```typescript
type ChartWidgetType = 
  | "people-flow-chart"
  | "traffic-heatmap"
  | "entry-rate-chart"
  | "occupancy-chart"
  | "comparative-chart"
  | "cumulative-chart";
```

### Layout Definitions

The backend should maintain these layout definitions for validation:

```typescript
interface LayoutDefinition {
  id: string;
  name: string;
  description: string;
  zones: {
    [zoneId: string]: {
      type: "metric" | "chart" | "any";
      required?: boolean;
    };
  };
}

const LAYOUT_DEFINITIONS: LayoutDefinition[] = [
  {
    id: "default",
    name: "Default Layout",
    description: "Standard dashboard with metrics on top and charts below",
    zones: {
      "metric-1": { type: "metric" },
      "metric-2": { type: "metric" },
      "metric-3": { type: "metric" },
      "chart-1": { type: "chart" },
      "chart-2": { type: "chart" },
      "chart-3": { type: "chart" }
    }
  },
  {
    id: "metrics-grid",
    name: "Metrics Grid", 
    description: "A 4x2 grid layout dedicated to metrics",
    zones: {
      "metric-1": { type: "metric" },
      "metric-2": { type: "metric" },
      "metric-3": { type: "metric" },
      "metric-4": { type: "metric" },
      "metric-5": { type: "metric" },
      "metric-6": { type: "metric" },
      "metric-7": { type: "metric" },
      "metric-8": { type: "metric" }
    }
  },
  {
    id: "compact-view",
    name: "Compact View",
    description: "Minimal layout with key metrics and one chart",
    zones: {
      "metric-1": { type: "metric" },
      "metric-2": { type: "metric" },
      "chart-1": { type: "chart" }
    }
  }
];
```

## Database Schema

### Primary Table

```sql
CREATE TABLE report_layout_placements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  layout_id VARCHAR(100) NOT NULL,
  widget_placements JSONB NOT NULL DEFAULT '{}',
  version VARCHAR(10) NOT NULL DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_user_layout UNIQUE(user_id, layout_id),
  CONSTRAINT valid_layout_id CHECK (layout_id ~ '^[a-z0-9-_]+$'),
  CONSTRAINT valid_widget_placements CHECK (jsonb_typeof(widget_placements) = 'object')
);
```

### Indexes

```sql
-- Primary lookup index
CREATE INDEX idx_layout_placements_user_layout 
ON report_layout_placements(user_id, layout_id);

-- Modified timestamp index for sync queries
CREATE INDEX idx_layout_placements_updated 
ON report_layout_placements(updated_at);

-- JSONB GIN index for widget placement queries
CREATE INDEX idx_layout_placements_widgets 
ON report_layout_placements USING GIN (widget_placements);
```

### Triggers

```sql
-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_layout_placements_updated_at 
BEFORE UPDATE ON report_layout_placements
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Validation Rules

### 1. Layout ID Validation
```typescript
function validateLayoutId(layoutId: string): boolean {
  const validLayouts = ['default', 'metrics-grid', 'compact-view'];
  return validLayouts.includes(layoutId) || /^custom-\d+$/.test(layoutId);
}
```

### 2. Widget Placement Validation
```typescript
function validateWidgetPlacements(
  layoutId: string, 
  placements: Record<string, string | null>
): ValidationResult {
  const layout = getLayoutDefinition(layoutId);
  const errors: string[] = [];
  
  for (const [zoneId, widgetType] of Object.entries(placements)) {
    // Check if zone exists in layout
    if (!layout.zones[zoneId]) {
      errors.push(`Invalid zone: ${zoneId}`);
      continue;
    }
    
    // Skip validation for null placements
    if (widgetType === null) continue;
    
    // Check widget type validity
    if (!isValidWidgetType(widgetType)) {
      errors.push(`Invalid widget type: ${widgetType}`);
      continue;
    }
    
    // Check zone-widget compatibility
    const zone = layout.zones[zoneId];
    if (!isCompatibleWidgetType(zone.type, widgetType)) {
      errors.push(`Widget ${widgetType} not compatible with zone ${zoneId} (type: ${zone.type})`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}
```

### 3. Widget Type Compatibility
```typescript
function isCompatibleWidgetType(zoneType: string, widgetType: string): boolean {
  if (zoneType === 'any') return true;
  
  const metricWidgets = [
    'total-in', 'total-out', 'entry-rate', 'daily-average-in',
    'daily-average-out', 'most-crowded-day', 'least-crowded-day',
    'percentage-change', 'returning-customers', 'avg-visit-duration', 'affluence'
  ];
  
  const chartWidgets = [
    'people-flow-chart', 'traffic-heatmap', 'entry-rate-chart',
    'occupancy-chart', 'comparative-chart', 'cumulative-chart'
  ];
  
  if (zoneType === 'metric') return metricWidgets.includes(widgetType);
  if (zoneType === 'chart') return chartWidgets.includes(widgetType);
  
  return false;
}
```

## Error Handling

### Standard Error Response Format

```typescript
interface ApiError {
  error: string;          // Human-readable error message
  details?: string;       // Additional error details
  code: string;          // Machine-readable error code
  timestamp: string;     // ISO 8601 timestamp
  requestId?: string;    // Request tracking ID
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_LAYOUT_ID` | Layout ID does not exist | 400 |
| `INCOMPATIBLE_WIDGET_ZONE` | Widget type not compatible with zone | 400 |
| `INVALID_WIDGET_TYPE` | Widget type does not exist | 400 |
| `PLACEMENTS_NOT_FOUND` | No saved placements for layout | 404 |
| `UNAUTHORIZED` | Invalid or missing authentication | 401 |
| `FORBIDDEN` | User lacks permission for operation | 403 |
| `VALIDATION_ERROR` | Request validation failed | 400 |
| `DATABASE_ERROR` | Database operation failed | 500 |
| `INTERNAL_ERROR` | Unexpected server error | 500 |

## Performance Considerations

### 1. Caching Strategy
- Cache layout definitions in memory
- Use Redis for frequently accessed user configurations
- Implement cache invalidation on updates

### 2. Database Optimization
- Use prepared statements for common queries
- Implement connection pooling
- Consider read replicas for heavy read workloads

### 3. Rate Limiting
```typescript
// Example rate limiting configuration
const rateLimits = {
  saveLayoutPlacements: { requests: 10, window: '1m' },
  loadLayoutPlacements: { requests: 100, window: '1m' },
  bulkUpdate: { requests: 5, window: '1m' }
};
```

## Security Considerations

### 1. Input Sanitization
- Validate all JSON inputs
- Sanitize layout IDs to prevent injection
- Limit widget placement object size

### 2. Authorization
- Users can only access their own configurations
- Implement role-based access for admin features
- Log all configuration changes for audit

### 3. Data Protection
- Encrypt sensitive configuration data at rest
- Use HTTPS for all API communication
- Implement request signing for critical operations

## Testing

### Unit Tests
```typescript
describe('Widget Placement Validation', () => {
  test('should accept valid widget placements', () => {
    const placements = { 'metric-1': 'total-in', 'chart-1': 'people-flow-chart' };
    const result = validateWidgetPlacements('default', placements);
    expect(result.valid).toBe(true);
  });
  
  test('should reject incompatible widget types', () => {
    const placements = { 'metric-1': 'people-flow-chart' }; // Chart in metric zone
    const result = validateWidgetPlacements('default', placements);
    expect(result.valid).toBe(false);
  });
});
```

### Integration Tests
```typescript
describe('POST /api/reports/layouts/placements', () => {
  test('should save valid placements', async () => {
    const response = await request(app)
      .post('/api/reports/layouts/placements')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        layoutId: 'default',
        widgetPlacements: { 'metric-1': 'total-in' }
      });
      
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## Monitoring

### Key Metrics
- API response times
- Error rates by endpoint
- Database query performance
- Cache hit rates
- User configuration change frequency

### Alerts
- High error rates (>5%)
- Slow response times (>500ms)
- Database connection issues
- Cache miss rates (>20%)

This API specification provides the complete backend requirements for implementing the Reports Drag & Drop Layout System.
