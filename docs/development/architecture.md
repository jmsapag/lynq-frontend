# Architecture Overview

This document provides a comprehensive overview of the LYNQ Frontend architecture, design patterns, and technical decisions.

## High-Level Architecture

### System Context

LYNQ Frontend is a React-based web application that serves as the user interface for the LYNQ pedestrian analytics platform. It connects to the LYNQ Backend API and provides role-based dashboards for different user types.

### Frontend Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  React Components │ Hero UI │ Tailwind CSS │ ECharts    │
├─────────────────────────────────────────────────────────┤
│                     Business Logic                       │
│  Custom Hooks │ React Context │ State Management        │
├─────────────────────────────────────────────────────────┤
│                    Service Layer                         │
│  API Clients │ Authentication │ Error Handling          │
├─────────────────────────────────────────────────────────┤
│                   Infrastructure                         │
│  Vite │ React Router │ Axios │ i18next                 │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Framework

- **React 18**: Modern React with Hooks, Suspense, and Concurrent Features
- **TypeScript 5**: Strict typing for better developer experience and code quality
- **Vite**: Fast development server and optimized production builds

### UI Framework & Styling

- **Hero UI**: Primary component library providing design system consistency
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Headless UI**: Unstyled, accessible UI components (when Hero UI doesn't suffice)

### Data Visualization

- **Apache ECharts**: Feature-rich charting library for sensor data visualization
- **Chart.js**: Alternative for simple charts (being phased out in favor of ECharts)

### Routing & Navigation

- **React Router v6**: Client-side routing with role-based route protection
- **Route Guards**: Custom components for authentication and authorization

### State Management

- **React Context**: Global state for authentication and app-level data
- **Custom Hooks**: Encapsulated state logic for data fetching and UI state
- **Local Storage**: Persistent user preferences and dashboard layouts

### API Communication

- **Axios**: HTTP client with interceptors for authentication and error handling
- **Cookie-based Auth**: Secure JWT token storage in httpOnly cookies

## Design Patterns

### Component Architecture

#### Component Hierarchy

```
App
├── Layout Components
│   ├── Header (Navigation, User Menu)
│   ├── Sidebar (Role-based Navigation)
│   └── Footer
├── Page Components
│   ├── Dashboard (Widget-based Layout)
│   ├── Comparison (Multi-location Views)
│   ├── Reports (Drag & Drop Layout)
│   └── UserManagement (Admin Only)
└── Shared Components
├── UI Components (Hero UI wrappers)
├── Chart Components (ECharts wrappers)
└── Form Components (Validation & Styling)
```

#### Feature-First Organization

```
src/
├── pages/
│   └── Dashboard/
│       ├── Dashboard.tsx          # Main page component
│       ├── components/           # Dashboard-specific components
│       │   ├── DashboardWidget.tsx
│       │   └── WidgetGrid.tsx
│       ├── hooks/               # Dashboard-specific hooks
│       │   └── useDashboardLayout.ts
│       └── types/               # Dashboard-specific types
│           └── dashboard.types.ts
```

### Authentication & Authorization Pattern

#### Role-Based Access Control

```typescript
// Role hierarchy (higher roles inherit lower permissions)
type UserRole = 'LYNQ_TEAM' | 'ADMIN' | 'STANDARD';

// Route protection pattern
<Route element={<RoleRoute allowedRoles={['ADMIN', 'LYNQ_TEAM']} />}>
  <Route path="user-management" element={<UserManagement />} />
</Route>

// Component-level role checking
const canManageUsers = hasRole(['ADMIN', 'LYNQ_TEAM']);
```

#### Authentication Flow

1. User logs in → Backend returns JWT in httpOnly cookie
2. Frontend stores user info in React Context
3. Axios interceptor automatically includes cookies in API requests
4. 401 responses trigger automatic logout and redirect to login

### Data Flow Architecture

#### Unidirectional Data Flow

```
User Action → Hook/Service → API Call → State Update → UI Re-render
```

#### Custom Hooks Pattern

```typescript
// Data fetching hook
const useSensorData = (locationId: number, dateRange: DateRange) => {
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch logic, error handling, caching
  return { data, loading, error, refetch };
};

// Usage in components
const Dashboard = () => {
  const { data, loading, error } = useSensorData(locationId, dateRange);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  return <DashboardContent data={data} />;
};
```

### State Management Strategy

#### Context for Global State

```typescript
// Authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Theme/UI preferences context
const UIContext = createContext<UIContextType | undefined>(undefined);
```

#### Local State for Component Logic

- Form state → `useState` or form libraries
- UI state (modals, dropdowns) → `useState`
- Derived state → `useMemo` and `useCallback`

#### URL State for Shareable Views

- Dashboard filters and date ranges
- Comparison view configurations
- Report parameters

### Error Handling Strategy

#### Error Boundaries

```typescript
// Page-level error boundary
<ErrorBoundary fallback={<ErrorPage />}>
  <Dashboard />
</ErrorBoundary>

// Component-level error handling
try {
  const data = await fetchSensorData();
} catch (error) {
  showErrorToast('Failed to load sensor data');
  logError(error);
}
```

#### API Error Handling

- 401 Unauthorized → Automatic logout and redirect
- 403 Forbidden → Show access denied message
- 500 Server Error → Show generic error with retry option
- Network errors → Show offline indicator

## Security Architecture

### Frontend Security Measures

#### Authentication Security

- JWT tokens stored in **httpOnly cookies** (not localStorage)
- Automatic token refresh before expiration
- Secure logout that clears all authentication state

#### Authorization Security

- Role-based route protection at router level
- Component-level permission checks
- API endpoints validate permissions server-side

#### Data Security

- Input sanitization for all user inputs
- XSS prevention through React's built-in protections
- CSRF protection via cookie-based auth
- Secure API communication over HTTPS only

### Permission System

#### Role Capabilities

```typescript
// LYNQ_TEAM: Full system access
- View all businesses and locations
- Manage system users
- Access system administration features

// ADMIN: Business-level access
- View business dashboard and locations
- Manage business users
- Configure business settings

// STANDARD: Location-level access
- View assigned location dashboards
- Generate reports for assigned locations
- Limited configuration access
```

## Performance Architecture

### Optimization Strategies

#### Code Splitting

```typescript
// Lazy loading for pages
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Reports = lazy(() => import("./pages/Reports/Reports"));

// Component-level code splitting for large features
const AdvancedCharts = lazy(() => import("./components/charts/AdvancedCharts"));
```

#### Data Loading Optimization

- Debounced search and filter inputs
- Pagination for large datasets
- Incremental loading for time series data
- Caching with TTL for frequently accessed data

#### Bundle Optimization

- Tree shaking for unused code elimination
- Vite's automatic code splitting
- Asset optimization and compression
- CDN delivery for static assets

### Chart Performance

- Canvas-based rendering with ECharts for large datasets
- Data aggregation strategies for different zoom levels
- Virtualization for large lists and tables
- Lazy loading of chart libraries

## Development Architecture

### Build System

- **Vite** for fast development and optimized production builds
- **TypeScript** strict mode for compile-time error detection
- **ESLint + Prettier** for code quality and consistency
- **Vitest** for unit testing with browser support

### Development Tools

- **Storybook** for component development and testing
- **React DevTools** for component debugging
- **Tailwind CSS IntelliSense** for styling assistance
- **TypeScript** language server for IDE support

### Testing Strategy

```
┌─────────────────┐
│  Unit Tests     │ ← Vitest, React Testing Library
├─────────────────┤
│  Component      │ ← Storybook, Visual Testing
│  Testing        │
├─────────────────┤
│  Integration    │ ← API mocking, Custom hooks testing
│  Testing        │
├─────────────────┤
│  End-to-End     │ ← Playwright, User workflows
│  Testing        │
└─────────────────┘
```

## Deployment Architecture

### Build Process

1. TypeScript compilation with strict type checking
2. Vite production build with optimization
3. Static asset bundling and compression
4. Environment variable injection
5. Production bundle analysis

### Environment Configuration

```typescript
// Environment-specific configurations
interface EnvironmentConfig {
  API_URL: string;
  AUTH_COOKIE_NAME: string;
  SENTRY_DSN?: string;
  ANALYTICS_ID?: string;
}
```

### Production Considerations

- Static file serving with proper cache headers
- Gzip/Brotli compression for assets
- Service worker for offline capability (future enhancement)
- Error tracking and monitoring integration
