# GitHub Copilot Instructions - LYNQ Frontend

## Repository Context

You are working in the **LYNQ Frontend** repository, which is the React-based web application for the LYNQ pedestrian analytics platform. This is a **React 18 + Vite** application using **TypeScript** and **Hero UI** for the design system.

## Repository-Specific Guidelines

### Architecture & Framework

- **React 18** with **TypeScript** and **Vite** as the build tool
- **Hero UI** design system for consistent UI components
- **Tailwind CSS** for styling and layout
- **React Router** for navigation and route protection
- **Axios** for API communication with role-based interceptors
- **npm** as the package manager

### Key Directories & Structure

- **Pages** (`src/pages/`): Main application pages (Dashboard, Comparison, UserManagement, etc.)
- **Components** (`src/components/`): Reusable UI components and layout components
- **Services** (`src/services/`): API clients and data fetching logic
- **Hooks** (`src/hooks/`): Custom React hooks, especially for authentication
- **Types** (`src/types/`): TypeScript type definitions
- **Utils** (`src/utils/`): Utility functions and helpers
- **i18n** (`src/i18n/`): Internationalization configuration

### Role-Based UI Patterns

- **LYNQ_TEAM**: Access to all businesses, system management, user management
- **ADMIN**: Business dashboard, location management, user management within business
- **STANDARD**: Location-specific dashboards, limited to assigned locations

### Development Practices

- Use **TypeScript** with strict typing for all components
- Implement **role-based route protection** using `<RoleRoute>` components
- Use **Hero UI components** for consistent design language
- Follow **React hooks** patterns for state management
- Implement **error boundaries** for graceful error handling
- Use **Tailwind CSS** classes for styling (avoid custom CSS)
- Store authentication tokens in **secure cookies** (js-cookie)

### Authentication & Authorization

- JWT tokens stored in **httpOnly cookies** for security
- **Private routes** require authentication (`<PrivateRoute>`)
- **Role-based routes** restrict access by user role (`<RoleRoute>`)
- Automatic **token refresh** and session management
- **Logout** functionality clears tokens and redirects

### API Integration Patterns

- Use **axiosPrivate** for authenticated requests
- Implement **automatic token injection** via interceptors
- Handle **401 responses** with automatic logout
- Use **React Query** patterns for data fetching and caching
- Implement **error handling** with user-friendly messages

### UI/UX Standards

- Follow **Hero UI** design patterns and components
- Use **responsive design** with Tailwind breakpoints
- Implement **loading states** for async operations
- Show **toast notifications** for user feedback
- Use **form validation** with clear error messages
- Implement **accessibility** standards (ARIA labels, keyboard navigation)

### Chart & Data Visualization

- Use **ECharts** for sensor data visualization
- Implement **responsive charts** that adapt to screen size
- Use **date pickers** for time range selection
- Show **aggregated data** by location and time periods
- Implement **real-time updates** where appropriate

## Documentation Reference

Refer to the `.ai/` folder in this repository for comprehensive documentation:

### Key Documentation Files

- **Architecture Overview**: `.ai/00_architecture.md` - System design and frontend's role
- **API Standards**: `.ai/01_standard_formats.md` - API response formats for frontend consumption
- **Code Structure**: `.ai/03_code_base.md` - Repository organization patterns
- **Technology Stack**: `.ai/04_tech_stack.md` - Frontend technology details
- **Dependencies**: `.ai/05_libraries.md` - UI library and package information
- **Security Practices**: `.ai/07_secure_development_mcp.md` - Frontend security requirements
- **System Flows**: `.ai/08_system_flows.md` - User authentication and data flow

### When to Reference Documentation

- **For component patterns**: Check `.ai/03_code_base.md` for established React patterns
- **API integration**: Reference `.ai/01_standard_formats.md` for response structure
- **Authentication flows**: See `.ai/08_system_flows.md` for login/logout patterns
- **Design system**: Check `.ai/05_libraries.md` for Hero UI component usage
- **Security requirements**: Follow `.ai/07_secure_development_mcp.md` for frontend security
- **Role-based UI**: Reference `.ai/08_system_flows.md` for access control patterns

## Code Examples & Patterns

When suggesting code, follow these patterns established in the codebase:

### Route Protection Pattern

```typescript
<Route element={<RoleRoute allowedRoles={["ADMIN", "LYNQ_TEAM"]} />}>
  <Route path="user-management" element={<UserManagement />} />
</Route>
```

### API Service Pattern

```typescript
export const getLocationData = async (
  locationId: number,
): Promise<LocationData> => {
  const response = await axiosPrivate.get(`/locations/${locationId}`);
  return response.data;
};
```

### Component with Hero UI

```typescript
import { Button, Card, CardBody } from "@heroui/react";

export const DashboardCard = ({ title, children }: Props) => (
  <Card className="w-full">
    <CardBody>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </CardBody>
  </Card>
);
```

### Authentication Hook Usage

```typescript
const userRole = getUserRoleFromToken();
const isAdmin = userRole === "ADMIN" || userRole === "LYNQ_TEAM";
```

Always ensure your suggestions align with the established patterns and design system documented in the `.ai/` folder.
