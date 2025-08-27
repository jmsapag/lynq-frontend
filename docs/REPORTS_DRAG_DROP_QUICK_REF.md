# Reports Drag & Drop - Quick Reference

## 🚀 Quick Start

### For Frontend Developers

```typescript
// Using the useReportLayout hook
import { useReportLayout } from '../../hooks/reports/useReportLayout';

const MyComponent = () => {
  const {
    currentLayout,          // Current layout configuration
    widgetPlacements,       // Current widget placements
    setCurrentLayout,       // Switch between layouts
    saveCurrentConfiguration, // Save changes
    isEditMode,            // Toggle edit/view mode
    handleDragStart,       // Drag event handler
    handleDragEnd          // Drop event handler
  } = useReportLayout();
  
  // Auto-save when widget placements change
  useEffect(() => {
    if (Object.keys(widgetPlacements).length > 0) {
      saveCurrentConfiguration();
    }
  }, [widgetPlacements]);
};
```

### For Backend Developers

```typescript
// Essential API endpoints to implement
POST /api/reports/layouts/placements     // Save widget placements
GET  /api/reports/layouts/placements/:id // Load widget placements
GET  /api/reports/layouts/configurations // Get all user configs
```

## 🎯 Core Concepts

### Widget Placements Data Structure
```json
{
  "metric-1": "total-in",      // Zone ID -> Widget Type
  "metric-2": "total-out",
  "metric-3": null,            // null = empty zone
  "chart-1": "people-flow-chart"
}
```

### Layout Types
- **default**: 3 metrics + 3 charts
- **metrics-grid**: 8 metric zones  
- **compact-view**: 2 metrics + 1 chart
- **custom-{id}**: User-created layouts

### Widget Categories
- **Metrics**: `total-in`, `total-out`, `entry-rate`, etc.
- **Charts**: `people-flow-chart`, `traffic-heatmap`, etc.

## 🔧 Implementation Checklist

### Frontend
- [ ] Import `useReportLayout` hook
- [ ] Handle drag-and-drop events
- [ ] Implement layout switching UI
- [ ] Add save/load functionality
- [ ] Handle edit/view mode toggle

### Backend  
- [ ] Create database table for placements
- [ ] Implement save endpoint with validation
- [ ] Implement load endpoint
- [ ] Add authentication middleware
- [ ] Handle error responses

### Database
```sql
-- Required table structure
CREATE TABLE report_layout_placements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  layout_id VARCHAR(100) NOT NULL,
  widget_placements JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, layout_id)
);
```

## 🐛 Common Issues

### Frontend
```typescript
// ❌ Don't directly mutate widgetPlacements
widgetPlacements['metric-1'] = 'total-in';

// ✅ Use the setter function instead  
setWidgetPlacements(prev => ({
  ...prev,
  'metric-1': 'total-in'
}));
```

### Backend
```typescript
// ❌ Don't skip validation
app.post('/placements', async (req, res) => {
  await savePlacements(req.body); // Dangerous!
});

// ✅ Always validate input
app.post('/placements', async (req, res) => {
  const validation = validateWidgetPlacements(req.body);
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }
  await savePlacements(req.body);
});
```

## 📊 Data Flow

```
User Action → useReportLayout Hook → ReportLayoutService → API → Database
    ↓              ↓                        ↓             ↓       ↓
Drag Widget → handleDragEnd → saveLayoutPlacements → POST → INSERT/UPDATE
```

## 🔍 Debugging Tips

### Check Widget Placement State
```typescript
// In React DevTools or browser console
console.log('Current placements:', widgetPlacements);
console.log('Current layout:', currentLayout);
```

### Verify API Calls
```bash
# Check if placements are being saved
curl -X POST https://api.lynq.com/v1/api/reports/layouts/placements \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"layoutId":"default","widgetPlacements":{"metric-1":"total-in"}}'
```

### Database Queries
```sql
-- Check saved placements for a user
SELECT layout_id, widget_placements, updated_at 
FROM report_layout_placements 
WHERE user_id = 123;
```

## 🎨 UI Components

### Required Components
- `ReportDragDropInterface` - Main container
- `ReportLayoutRenderer` - Renders drop zones
- `ReportSidebar` - Widget palette
- `useReportLayout` - State management hook

### Styling Classes
```css
/* Drop zones */
.drop-zone-active { border: 2px dashed #3b82f6; }
.drop-zone-valid { background: #dbeafe; }
.drop-zone-invalid { background: #fee2e2; }

/* Dragged widgets */
.dragging { opacity: 0.5; transform: rotate(5deg); }
```

## 🚦 Status Indicators

### Edit Mode States
- **View Mode**: Read-only, clean layout
- **Edit Mode**: Drag-and-drop enabled, sidebar visible
- **Saving**: Show loading state during API calls

### Visual Feedback
- Highlight compatible drop zones
- Show dragged widget preview
- Display save success/error messages

## 📱 Mobile Considerations

```typescript
// Handle touch events for mobile
const handleTouchStart = (e: TouchEvent) => {
  // Implement touch-based drag start
};

// Responsive layout switching
const isMobile = useMediaQuery('(max-width: 768px)');
if (isMobile) {
  // Simplify UI for mobile
}
```

## 🔒 Security Notes

### Frontend
- Validate widget types before placement
- Sanitize user input for custom layouts
- Handle API errors gracefully

### Backend  
- Authenticate all requests
- Validate layout IDs and widget types
- Limit request size and frequency
- Log configuration changes for audit

## 📈 Performance Tips

### Frontend
```typescript
// Debounce auto-save to avoid excessive API calls
const debouncedSave = useMemo(
  () => debounce(saveCurrentConfiguration, 1000),
  [saveCurrentConfiguration]
);

// Use React.memo for expensive widget components
const Widget = React.memo(({ type, data }) => {
  // Expensive rendering logic
});
```

### Backend
```sql
-- Index for faster queries
CREATE INDEX idx_layout_placements_user_layout 
ON report_layout_placements(user_id, layout_id);

-- Cache frequently accessed data
const layoutCache = new Map();
```

## 🧪 Testing Examples

### Frontend Tests
```typescript
test('should save placements when layout changes', async () => {
  const { result } = renderHook(() => useReportLayout());
  
  act(() => {
    result.current.setCurrentLayout('metrics-grid');
  });
  
  await waitFor(() => {
    expect(mockSaveLayoutPlacements).toHaveBeenCalled();
  });
});
```

### Backend Tests  
```typescript
test('POST /placements should return 201 for valid data', async () => {
  const response = await request(app)
    .post('/api/reports/layouts/placements')
    .send({
      layoutId: 'default',
      widgetPlacements: { 'metric-1': 'total-in' }
    });
    
  expect(response.status).toBe(201);
});
```

---

For detailed documentation, see:
- [Complete System Documentation](./REPORTS_DRAG_DROP_SYSTEM.md)
- [API Specification](./REPORTS_LAYOUT_API_SPEC.md)
