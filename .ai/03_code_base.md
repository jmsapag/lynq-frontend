# 03_code_base.md

## Repository structure

```
lynq/
├── lynq-api/               # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication & authorization
│   │   ├── business/       # Business management
│   │   ├── devices/        # Sensor device management
│   │   ├── location/       # Location management
│   │   ├── users/          # User management
│   │   ├── prisma/         # Database service
│   │   └── dto/            # Data transfer objects
│   ├── test/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── models/         # Prisma model definitions
│   │   └── migrations/     # Database migrations
│   └── Dockerfile
├── lynq-frontend/          # React dashboard
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API clients
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript definitions
│   └── package.json
├── normalizer/             # Express service
│   ├── src/
│   │   ├── controllers/    # Sensor-specific controllers
│   │   ├── adapters/       # Data transformation
│   │   ├── models/         # Sensor data models
│   │   └── services/       # Business logic
│   └── Dockerfile
├── infra/                  # Docker compose & config
│   ├── docker-compose.yml
│   ├── mosquitto/
│   └── postgres/
└── people-counter-docs-md/ # Documentation
```

## NestJS controller example (`lynq-api/src/devices/devices.controller.ts`)

```ts
@Controller("devices")
@UseGuards(AuthGuard, RolesGuard)
@ApiTags("devices")
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get("sensor-data")
  @ApiOperation({
    summary: "Get aggregated sensor data with role-based permissions",
  })
  async getSensorData(
    @Query("sensor_ids", new ParseArrayPipe({ items: Number, separator: "," }))
    sensorIds: number[],
    @Req() req: UserRequest,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ): Promise<GroupedSensorDataDto[]> {
    const query: GetLocationSensorDataDto = {
      sensor_ids: sensorIds,
      from,
      to,
    };
    return this.devicesService.getSensorData(query, req.user);
  }
}
```

## Normalizer controller example (`normalizer/src/controllers/xovisController.ts`)

```ts
import { globalService } from "../services/globalService";
import { doorSensorRecord } from "../adapters/types";
import { Xovis } from "../models/xovis";

const xovisAdapter = (xovisJson: Xovis): doorSensorRecord => {
  return {
    id: xovisJson.id,
    name: xovisJson.name,
    type: xovisJson.type,
    data: {
      in: xovisJson.data.in,
      out: xovisJson.data.out,
    },
    timestamp: xovisJson.timestamp,
  };
};

export const xovisController = (message: string): void => {
  let xovis: Xovis;
  try {
    xovis = JSON.parse(message);
    const xovisRecord: doorSensorRecord = xovisAdapter(xovis);
    globalService.processDoorRecord(xovisRecord);
  } catch (error) {
    console.error("Error parsing Xovis message:", error);
  }
};
```

## Environment variables (`.env.sample`)

```
# Database
DATABASE_URL=postgresql://user:pass@db:5432/lynq_db

# MQTT
MQTT_HOST=mosquitto:1883
MQTT_USERNAME=lynq_user
MQTT_PASSWORD=secure_password

# JWT
JWT_SECRET=your_jwt_secret_here

# API
PORT=3000
USE_HTTPS=false
SSL_KEY_PATH=/path/to/key.pem
SSL_CERT_PATH=/path/to/cert.pem

# Node Environment
NODE_ENV=production
```

## Prisma schema structure (`lynq-api/prisma/schema.prisma`)

```prisma
model Business {
  id          Int      @id @default(autoincrement())
  name        String
  address     String
  created_at  DateTime @default(now())
  users       User[]
  locations   Location[]
  registration_tokens Registration_Token[]
}

model Location {
  id          Int      @id @default(autoincrement())
  name        String
  address     String
  business_id Int
  business    Business @relation(fields: [business_id], references: [id])
  sensors     Sensor[]
  users       user_locations[]
}

model Sensor {
  id            Int      @id @default(autoincrement())
  serial_number String   @unique
  provider      String   // FootfallCam, Xovis, Hella
  position      String
  location_id   Int
  location      Location @relation(fields: [location_id], references: [id])
  sensorData    Sensor_Data[]
}
```

## Role-based access control

```ts
// Guards example
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller("business")
export class BusinessController {
  // Only ADMIN users can access business endpoints
}

// Three-tier role system:
enum Role {
  LYNQ_TEAM = "LYNQ_TEAM", // Super admin - all businesses
  ADMIN = "ADMIN", // Business admin - single business
  STANDARD = "STANDARD", // Location user - assigned locations only
}
```
