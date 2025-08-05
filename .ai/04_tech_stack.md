# 04_tech_stack.md

| Layer            | Technology / Version           | Notes                                      |
|------------------|--------------------------------|--------------------------------------------|
| Language         | Node.js 20 (LTS)               | TypeScript across all services            |
| Backend API      | NestJS 11                      | Modular architecture with guards          |
| Ingestion        | Express 5                      | `normalizer` service                       |
| Database         | PostgreSQL 14+                 | With Prisma ORM                           |
| Messaging        | Mosquitto 2                    | MQTT broker with auth                      |
| Frontend         | React 18 + Vite                | Hero UI design system                     |
| ORM / DB client  | Prisma 6                       | Generates TypeScript types                 |
| Containers       | Docker 25                      | Multi‑stage builds                         |
| CI/CD            | GitHub Actions                 | build, test, push, deploy                  |
| Hosting          | Docker Compose                 | Local and production deployment            |
| Logs             | Winston + NestJS               | Structured JSON logging                    |
| Auth             | JWT + bcrypt                   | Role-based access control                 |
| API Docs         | Swagger/OpenAPI                | Auto-generated from decorators            |
| Static analysis  | ESLint + Prettier              | Code quality enforcement                   |
| Package Manager  | pnpm (API), npm (Frontend)     | Fast, efficient package management        |

## Version details

### API (NestJS)
- **NestJS Core**: 11.0.1
- **Prisma**: 6.7.0
- **JWT**: 11.0.0
- **bcrypt**: 6.0.0
- **Winston**: via nest-winston 1.10.2

### Frontend (React)
- **React**: 18.2.0
- **Vite**: 4.2.1
- **Hero UI**: 2.7.8
- **Axios**: 1.9.0
- **TypeScript**: 5.2.2

### Normalizer (Express)
- **Express**: 5.1.0
- **MQTT**: 5.12.0
- **Prisma Client**: 6.8.2
- **TypeScript**: 5.8.3

### Infrastructure
- **PostgreSQL**: 14+ (latest available)
- **Mosquitto**: 2.x (eclipse-mosquitto:2)
- **Docker**: 25.x
- **Docker Compose**: 3.8 format

## Database schema
- **Prisma**: Handles migrations, type generation, and query building
- **Multi-tenant**: Business → Location → Sensor hierarchy
- **Role-based**: LYNQ_TEAM, ADMIN, STANDARD user roles
- **Audit trail**: Created timestamps on all entities

## Authentication flow
- **Registration**: Token-based user creation
- **Login**: JWT with user role and business association
- **Authorization**: Route guards with role checking
- **Session**: Stateless JWT tokens
