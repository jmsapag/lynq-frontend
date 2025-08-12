# 01_standard_formats.md

## General conventions

- **Timestamps:** ISO‑8601 in UTC (`YYYY‑MM‑DDTHH:MM:SSZ`)
- **IDs:** Auto-incrementing integers for database entities, UUIDs for tokens
- **JSON keys:** camelCase for frontend, snake_case for database
- **Payload versioning:** Handled per sensor brand in normalizer

## 1. Normalized sensor event (Internal Database Schema)

```json
{
  "id": 1,
  "timestamp": "2025-08-04T10:21:05Z",
  "type": "DOOR",
  "sensor_id": 123,
  "doorRecord": {
    "count_in": 3,
    "count_out": 1
  }
}
```

- `type` values: `DOOR`, `AREA`
- Supports different sensor data structures via `doorRecord`/`areaRecord`

## 2. API response `/devices/sensor-data`

```json
{
  "statusCode": 200,
  "message": "Sensor data retrieved successfully",
  "data": [
    {
      "location": {
        "id": 1,
        "name": "Main Entrance",
        "address": "123 Main St"
      },
      "sensors": [
        {
          "id": 123,
          "serial_number": "FC001",
          "provider": "FootfallCam",
          "data": [
            {
              "timestamp": "2025-08-04T10:00:00Z",
              "count_in": 25,
              "count_out": 20
            }
          ]
        }
      ]
    }
  ]
}
```

## 3. Business/Location hierarchy

```json
{
  "business": {
    "id": 1,
    "name": "Retail Chain Corp",
    "address": "Corporate HQ"
  },
  "locations": [
    {
      "id": 1,
      "name": "Store Downtown",
      "address": "123 Main St",
      "sensors": [
        {
          "id": 123,
          "serial_number": "FC001",
          "provider": "FootfallCam",
          "position": "entrance"
        }
      ]
    }
  ]
}
```

## 4. User roles and permissions

```json
{
  "user": {
    "id": 1,
    "name": "John Admin",
    "email": "john@business.com",
    "role": "ADMIN",
    "business_id": 1,
    "locations": [1, 2, 3]
  }
}
```

- Roles: `LYNQ_TEAM`, `ADMIN`, `STANDARD`
- `LYNQ_TEAM`: Access to all businesses and system management
- `ADMIN`: Full access within their business
- `STANDARD`: Access only to assigned locations

## 5. MQTT message formats per sensor brand

### FootfallCam

```json
{
  "device_id": "fc001",
  "timestamp": "2025-08-04T10:21:05Z",
  "in": 3,
  "out": 1
}
```

### Xovis

```json
{
  "id": "xv001",
  "name": "Entrance Sensor",
  "type": "door",
  "timestamp": "2025-08-04T10:21:05Z",
  "data": {
    "in": 3,
    "out": 1
  }
}
```

### Hella

```json
{
  "sensor_id": "hl001",
  "timestamp": "2025-08-04T10:21:05Z",
  "count_in": 3,
  "count_out": 1
}
```

## 6. Standard error definition

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## 7. API versioning

- No explicit versioning in URLs currently
- Backward compatibility maintained through Prisma migrations
- Breaking changes would require new API versions
