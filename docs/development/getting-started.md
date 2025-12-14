# Getting Started - Development Setup

This guide will help you set up the LYNQ Frontend development environment from scratch.

## Prerequisites

### Required Software

- **Node.js**: 18+ LTS (recommend latest LTS version)
- **npm**: 8+ (comes with Node.js)
- **Git**: Latest version
- **IDE**: WebStorm, VSCode, or similar with TypeScript support

### Recommended Extensions (for VSCode)

- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd lynq-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
nano .env
```

**Required Environment Variables:**

```bash
VITE_API_URL=http://localhost:8080  # Backend API URL
```

### 4. Verify Installation

```bash
# Run development server
npm run dev

# Should open http://localhost:5173
# You should see the LYNQ login page
```

## Development Workflow

### Daily Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Lint and format code
npm run lint
npm run format

# Build for production (testing)
npm run build
npm run preview
```

### Development Server Features

- **Hot Module Replacement**: Instant updates on code changes
- **API Proxy**: `/api` requests proxied to backend
- **TypeScript**: Real-time type checking
- **Source Maps**: Debug with original source code

## Project Structure Overview

```
lynq-frontend/
├── src/
│   ├── pages/              # Route-level components
│   │   ├── Dashboard/      # Dashboard with widgets
│   │   ├── Comparison/     # Multi-location comparison
│   │   ├── Reports/        # Report generation
│   │   └── UserManagement/ # Admin user management
│   ├── components/         # Reusable UI components
│   │   ├── layout/         # App shell, navigation
│   │   ├── ui/             # Generic UI components
│   │   └── charts/         # ECharts components
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Authentication state
│   │   └── useSensorData.ts # Data fetching
│   ├── services/           # API clients
│   │   ├── auth.ts         # Authentication API
│   │   ├── sensors.ts      # Sensor data API
│   │   └── users.ts        # User management API
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Helper functions
│   └── i18n/               # Internationalization
├── docs/                   # Project documentation
├── .ai/                    # AI assistant context
└── public/                 # Static assets
```

## Key Development Concepts

### Authentication Flow

1. User logs in → JWT tokens stored in httpOnly cookies
2. `axiosPrivate` automatically includes tokens in requests
3. Role-based route protection using `<RoleRoute>` components
4. Automatic logout on token expiration

### Component Patterns

- **Hero UI Components**: Use Hero UI design system consistently
- **TypeScript**: Strict typing for all components and APIs
- **Tailwind CSS**: Utility-first styling approach
- **Role-based Rendering**: Show/hide UI based on user permissions

### State Management

- **React Hooks**: Custom hooks for data fetching and state
- **Context**: Authentication and global app state
- **Local Storage**: Dashboard layouts and user preferences
- **URL State**: Filters, pagination, and view settings

## Backend Integration

### API Configuration

The frontend connects to the LYNQ Backend via REST APIs:

- **Base URL**: Configured via `VITE_API_URL`
- **Authentication**: JWT tokens in cookies
- **Error Handling**: Automatic 401 logout, user-friendly messages

### Key API Endpoints

```typescript
// Authentication
POST /auth/login
POST /auth/logout
GET /auth/me

// Sensor Data
GET /sensors/data?locationId=123&from=...&to=...
GET /sensors/records

// User Management (Admin only)
GET /users
POST /users
PUT /users/:id
DELETE /users/:id
```

## Testing Strategy

### Unit Tests (Vitest)

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Component Testing (Storybook)

```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

### End-to-End Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E in UI mode
npm run test:e2e:ui
```

## Code Quality

### Linting & Formatting

The project uses ESLint + Prettier with strict TypeScript rules:

```bash
# Check for linting errors
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### Pre-commit Hooks

- Automatically runs linting and formatting
- Prevents commits with TypeScript errors
- Ensures consistent code style

## Common Issues & Solutions

### Development Server Won't Start

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

- Ensure all dependencies are properly typed
- Check `tsconfig.json` for strict settings
- Use `// @ts-ignore` sparingly and with comments

### API Connection Issues

- Verify `VITE_API_URL` in `.env` file
- Check backend server is running
- Review browser network tab for CORS issues

### Hot Reload Not Working

- Check file permissions
- Restart development server
- Clear browser cache
