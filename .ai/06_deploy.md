# 06_deploy.md

## Docker Compose Deployment

The LYNQ system is deployed using Docker Compose with the following services:

### Production docker-compose.yml structure

```yaml
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: ${PG_USER}
      POSTGRES_PASSWORD: ${PG_PASSWORD}
      POSTGRES_DB: ${PG_NAME}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mosquitto:
    image: eclipse-mosquitto:2
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./mosquitto/config:/mosquitto/config

  lynq-api:
    image: ghcr.io/austral-lynq/lynq-api:latest-stable
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=${DB_URL}
      - PORT=3000
    ports:
      - "8000:3000"

  normalizer:
    image: ghcr.io/austral-lynq/normalizer:latest-stable
    depends_on:
      - mosquitto
    environment:
      - MQTT_HOST=mosquitto:1883
      - DATABASE_URL=${DB_URL}
```

## Container Images

### API Dockerfile (Multi-stage)

```dockerfile
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
RUN npx prisma generate

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
CMD ["node", "dist/main.js"]
```

### Normalizer Dockerfile

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

## CI/CD Pipeline (GitHub Actions)

```yaml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
    tags: ["v*.*.*"]

jobs:
  build-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: cd lynq-api && pnpm install
      - name: Run tests
        run: cd lynq-api && pnpm test
      - name: Build Docker image
        run: |
          docker build -t ghcr.io/austral-lynq/lynq-api:${{ github.sha }} ./lynq-api
          docker push ghcr.io/austral-lynq/lynq-api:${{ github.sha }}

  build-normalizer:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: |
          docker build -t ghcr.io/austral-lynq/normalizer:${{ github.sha }} ./normalizer
          docker push ghcr.io/austral-lynq/normalizer:${{ github.sha }}

  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install and build
        run: |
          cd lynq-frontend
          npm install
          npm run build
```

## Deployment Process

### 1. Infrastructure Setup

```bash
# Clone repository
git clone https://github.com/austral-lynq/infra
cd infra

# Set environment variables
cp .env.example .env
# Edit .env with production values

# Start services
docker-compose up -d
```

### 2. Database Setup

```bash
# Run database migrations
docker exec lynq-api npx prisma migrate deploy

# Optional: Seed initial data
docker exec lynq-api npm run prisma:seed
```

### 3. Service Configuration

#### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@postgres:5432/lynq_db

# MQTT
MQTT_HOST=mosquitto:1883
MQTT_USERNAME=lynq_user
MQTT_PASSWORD=secure_mqtt_password

# JWT
JWT_SECRET=your_production_jwt_secret

# SSL (optional)
USE_HTTPS=false
SSL_KEY_PATH=/etc/letsencrypt/live/domain/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/domain/fullchain.pem
```

## Service Resource Requirements

| Service    | CPU | Memory | Notes                       |
| ---------- | --- | ------ | --------------------------- |
| postgres   | 0.5 | 512 MB | Adjust based on data volume |
| mosquitto  | 0.1 | 64 MB  | Lightweight message broker  |
| lynq-api   | 1.0 | 512 MB | Main application service    |
| normalizer | 0.5 | 256 MB | MQTT message processing     |

## Health Checks

### API Health Check

```bash
curl http://localhost:8000/
# Should return application greeting
```

### Database Health

```bash
docker exec lynq-api npx prisma db pull
# Should connect successfully
```

### MQTT Health

```bash
docker logs mosquitto
# Should show client connections
```

## Monitoring

### Application Logs

```bash
# View API logs
docker logs -f lynq-api

# View Normalizer logs
docker logs -f normalizer

# View all service logs
docker-compose logs -f
```

### Swagger Documentation

- Available at: `http://localhost:8000/api/docs`
- Auto-generated from NestJS decorators
- Includes authentication testing

## Backup Strategy

### Database Backup

```bash
# Create backup
docker exec postgres pg_dump -U ${PG_USER} ${PG_NAME} > backup.sql

# Restore backup
docker exec -i postgres psql -U ${PG_USER} ${PG_NAME} < backup.sql
```

### Configuration Backup

- Store `.env` files securely
- Version control `docker-compose.yml`
- Backup Mosquitto configuration files
