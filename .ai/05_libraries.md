# 05_libraries.md

## Key dependencies by service

### API (NestJS)
- `@nestjs/core@11.0.1`, `@nestjs/common@11.0.1`, `@nestjs/config@4.0.2`
- `@nestjs/jwt@11.0.0`, `@nestjs/platform-express@11.0.1`
- `@nestjs/schedule@6.0.0`, `@nestjs/swagger@11.2.0`
- `@prisma/client@6.7.0`
- `class-validator@0.14.2`, `class-transformer@0.5.1`
- `jsonwebtoken@9.0.2`, `bcrypt@6.0.0`, `bcryptjs@3.0.2`
- `nest-winston@1.10.2`
- `date-fns@4.1.0`, `uuid@11.1.0`
- `swagger-ui-express@5.0.1`

### Normalizer (Express)
- `express@5.1.0`
- `mqtt@5.12.0`
- `@prisma/client@6.8.2`
- `dotenv@16.5.0`

### Frontend (React + Vite)
- `react@18.2.0`, `react-dom@18.2.0`
- `@heroui/react@2.7.8` (Design system)
- `@headlessui/react@2.2.2`, `@heroicons/react@2.1.1`
- `axios@1.9.0`
- `react-router-dom@6.21.1`
- `date-fns@4.1.0`, `date-fns-tz@3.2.0`
- `echarts@5.6.0`, `echarts-for-react@3.0.2` (Charts)
- `framer-motion@12.12.2` (Animations)
- `i18next@25.0.2`, `react-i18next@15.5.1` (Internationalization)
- `js-cookie@3.0.5`
- `react-tailwindcss-datepicker@2.0.0`

### Dev / Build Tools
- `typescript@5.2.2+` (all services)
- `ts-node@10.9.2`
- `eslint@8.55.0+`, `prettier@3.1.1+`
- `jest` (API testing)
- `vite@4.2.1` (Frontend build)
- `tailwindcss@3.4.0` (CSS framework)
- `autoprefixer@10.4.16`, `postcss@8.4.32`

### Infrastructure
- `docker`, `docker-compose`
- `prisma@6.7.0+` (Schema management)

### Database
- `postgresql@14+`
- Prisma migrations and type generation

### MQTT & Messaging
- `eclipse-mosquitto:2` (Docker image)
- `mqtt@5.12.0` (Client library)

### Monitoring & Logging
- `winston` (via nest-winston)
- Swagger/OpenAPI documentation
- Docker healthchecks

### Security
- JWT token validation
- bcrypt password hashing
- Role-based access control guards
- Input validation with class-validator

### UI/UX Libraries
- **Hero UI**: Modern React UI library
- **Tailwind CSS**: Utility-first CSS framework
- **ECharts**: Data visualization charts
- **Framer Motion**: Animation library
- **Headless UI**: Unstyled, accessible UI components

## Package management
- **API**: pnpm (fast, efficient)
- **Frontend**: npm (standard)
- **Normalizer**: npm

## Development tools
- **ESLint**: Code linting and quality
- **Prettier**: Code formatting
- **TypeScript**: Type safety across all services
- **Prisma Studio**: Database GUI for development
- **Vite**: Fast frontend development server
- **Nodemon**: Auto-restart for development
