# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Development
- `npm run dev` - Start development server with Vite (requires VITE_API_URL env var)
- `npm run build` - Build for production (runs TypeScript compiler + Vite build)
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Run ESLint with TypeScript, React, and Prettier rules
- `npm run format` - Format code with Prettier

### Storybook
- `npm run storybook` - Start Storybook development server on port 6006
- `npm run build-storybook` - Build static Storybook

## Architecture Overview

This is a **React 18 + TypeScript + Vite** frontend for the LYNQ pedestrian analytics platform using **Hero UI** design system and **Tailwind CSS**.

### Key Technologies
- **Build Tool**: Vite with TypeScript compilation
- **UI Framework**: Hero UI components with Tailwind CSS
- **Routing**: React Router v6 with role-based route protection
- **HTTP Client**: Axios with JWT token interceptors
- **Charts**: ECharts for data visualization
- **Export**: HTML2Canvas + jsPDF for report generation
- **i18n**: react-i18next with English/Spanish support

### Authentication & Authorization
- **JWT tokens** stored in secure httpOnly cookies (js-cookie)
- **Role-based access**: LYNQ_TEAM (all access), ADMIN (business management), STANDARD (location-specific)
- **Route protection**: `<PrivateRoute>` for authentication, `<RoleRoute>` for authorization
- **Token management**: Automatic injection via Axios interceptors, 401 handling

### Core Architecture Patterns

#### Component Organization
- **Feature-first structure** (not atomic design) as documented in `docs/folderStructureConventions.md`
- **Layout Dashboard**: Advanced drag-drop widget system with localStorage persistence
- **Charts**: Reusable ECharts components with data aggregation hooks
- **Auth Components**: Role-based route guards and authentication flows

#### Data Management
- **Custom hooks** for data fetching (sensor data, users, locations, devices)
- **Time series aggregation** with configurable grouping strategies (5min, 15min, hour, day, week, month)
- **Real-time filtering** hooks for date ranges and sensor selection
- **Export utilities** for PNG, PDF, and CSV formats

#### State Management
- **React hooks** for component state
- **Context-free approach** - data passed through props and custom hooks
- **localStorage** for dashboard layouts and user preferences
- **Cookies** for authentication tokens

### Key Directories

#### Core Application
- `src/pages/` - Route-level page components (Dashboard, Comparison, UserManagement)
- `src/components/` - Reusable UI components organized by domain
- `src/hooks/` - Custom React hooks for data fetching and state management
- `src/services/` - API clients with role-based interceptors

#### Business Logic
- `src/utils/` - Utility functions (date handling, export functionality)
- `src/types/` - TypeScript definitions for API responses and domain models
- `src/i18n/` - Internationalization configuration and translations

#### Specialized Features
- `src/components/dashboard/layout-dashboard/` - Drag-drop dashboard system
- `src/components/dashboard/charts/` - Data visualization components
- `src/hooks/sensor-data/` - Complex data aggregation and filtering logic

### API Integration
- **Base URL**: `/api` (proxied to backend via Vite config)
- **Authentication**: Bearer tokens via `axiosPrivate` client
- **Error handling**: 401 responses trigger logout, user-friendly error messages
- **Response formats**: Standardized as per `.github/copilot-instructions.md`

### Role-Based Features
- **LYNQ_TEAM**: System administration, all businesses access, device management
- **ADMIN**: Business dashboard, location management, user management within business
- **STANDARD**: Location-specific dashboards, limited to assigned locations

## Development Notes

### Environment Setup
- Requires `VITE_API_URL` environment variable for backend connection
- Development server proxies `/api` requests to backend
- Uses ES modules and strict TypeScript configuration

### Testing & Quality
- **ESLint**: TypeScript + React + Prettier integration
- **Storybook**: Component documentation and testing
- **Strict TypeScript**: All hooks and unused parameters/locals checked

### Deployment
- **Vercel configuration** present (`vercel.json`)
- **Static build** output to `dist/` directory
- **Base URL** configurable via environment variables


## Project Context
To have context of the global context please refer to items under .ai folder. 
Items .ai/*