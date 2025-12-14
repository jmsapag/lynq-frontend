# LYNQ Frontend

**React 18 + TypeScript + Vite** frontend for the LYNQ pedestrian analytics platform.

## Quick Start

1. **Clone and install**:

   ```bash
   git clone <repository-url>
   cd lynq-frontend
   npm install
   ```

2. **Environment setup**:

   ```bash
   cp .env.example .env
   # Edit .env with your VITE_API_URL
   ```

3. **Development**:
   ```bash
   npm run dev
   # Open http://localhost:5173
   ```

## Scripts

| Command             | Description              |
| ------------------- | ------------------------ |
| `npm run dev`       | Start development server |
| `npm run build`     | Build for production     |
| `npm run preview`   | Preview production build |
| `npm run lint`      | Run ESLint               |
| `npm run format`    | Format with Prettier     |
| `npm run test`      | Run Vitest tests         |
| `npm run storybook` | Start Storybook          |

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Hero UI, Tailwind CSS
- **Charts**: ECharts
- **Testing**: Vitest, Playwright, Storybook
- **Auth**: JWT tokens in httpOnly cookies

## Development

- **Node.js**: 18+ LTS
- **Package Manager**: npm
- **IDE**: VSCode with TypeScript/React extensions recommended

## Project Structure

```
src/
├── pages/          # Route-level components
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── services/       # API clients
├── types/          # TypeScript definitions
└── utils/          # Helper functions
```

## Contributing

1. Follow TypeScript strict mode
2. Use Hero UI components
3. Implement role-based access control
4. Write tests for new features
5. Run `npm run lint` before commits
