# 00_architecture.md

**Project:** LYNQ  
**Generated:** 2025-08-04

## Overview

_LYNQ_ is a pedestrian traffic counting and analytics platform that ingests real‑time events from multiple sensor types (FootfallCam, Xovis, Hella) and exposes metrics through a REST API.  
The solution runs using Docker containers with a multi-business, multi-location architecture.

## Core components

| Component         | Technology                | Primary responsibility                                   |
| ----------------- | ------------------------- | -------------------------------------------------------- |
| **Sensors**       | FootfallCam, Xovis, Hella | Generate IN / OUT sensor events                          |
| **MQTT Broker**   | Mosquitto 2.x             | Receives sensor events and republishes internally        |
| **Normalizer**    | Express + Node 20         | Transforms raw payloads to a unified internal schema     |
| **API**           | NestJS 11                 | Exposes REST endpoints for the frontend and integrations |
| **Database**      | PostgreSQL 14+            | Stores normalized events and business/location data      |
| **Web Frontend**  | React + Vite              | Dashboards and reports using Hero UI                     |
| **Job Scheduler** | NestJS Schedule           | Scheduled tasks and aggregation                          |
| **Logging**       | Winston + Nest            | JSON structured logs                                     |

## Logical diagram (ASCII)

```
         +-----------+
         |  Sensors  |
         | (Multiple |
         |  Brands)  |
         +-----+-----+
               | MQTT (mqtt://broker:1883)
         +-----v-----+
         | Mosquitto |
         +-----+-----+
               | topics: xovis, hella, footfallcam/+
    +----------v-----------+
    |   Normalizer svc     |
    +----------+-----------+
               | Direct DB INSERT → PG
         +-----v-----+     +-------------------+
         |  API svc  |---->|  PostgreSQL DB    |
         +-----+-----+     +-------------------+
               | REST/JSON
         +-----v-----+
         | Frontend  |
         +-----------+
```

## Data flow (high level)

1. **Sensor** publishes to brand-specific topics (`xovis`, `hella`, `footfallcam/+`) via MQTT.
2. **Mosquitto** forwards the message to **Normalizer** via subscription.
3. **Normalizer**
   - Validates format per sensor brand.
   - Maps fields to the internal schema.
   - Persists normalized sensor data to PostgreSQL.
4. **API** exposes endpoints for businesses, locations, devices, and sensor data with role-based access.
5. **Frontend** queries the API for dashboards; includes multi-business support.

## Database Schema

The system uses a hierarchical structure:

- **Business** → **Location** → **Sensor** → **Sensor_Data**
- **Users** are associated with businesses and can be assigned to specific locations
- Three user roles: `LYNQ_TEAM`, `ADMIN`, `STANDARD`

## Scalability notes

- **Normalizer** and **API** run as Docker containers that can be scaled horizontally.
- Mosquitto supports authentication and multiple sensor brands.
- Database uses Prisma ORM with PostgreSQL for efficient queries.

## Authentication

- JWT signed with configurable secret.
- Roles: `LYNQ_TEAM` (super admin), `ADMIN` (business admin), `STANDARD` (location-based access).
- Registration token system for user onboarding.

## Observability

- Winston logs integrated with NestJS.
- Swagger API documentation at `/api/docs`.
- Prisma database monitoring and query optimization.

## External dependencies

- Multiple sensor brand APIs and MQTT feeds.
- Docker for containerization.
- GitHub for repositories and CI/CD.

## Data flow (high level)

1. **Sensor** publishes to `sensors/<device_id>/events` (MQTT).
2. **Mosquitto** forwards the message to **Normalizer** via subscription.
3. **Normalizer**
   - Validates format.
   - Maps fields to the internal schema.
   - Persists both the raw (`raw_events`) and normalized (`footfall_events`) records.
4. **API** exposes endpoints `/v1/footfall` and aggregates on‑the‑fly or reads pre‑aggregated tables.
5. **Frontend** queries the API for dashboards; results may be cached in Redis (optional).

## Scalability notes

- **Normalizer** and **API** can be scaled horizontally behind a load balancer (GCP L7).
- Mosquitto supports cluster bridging if needed.
- Partition tables by date range to prevent bloat.

## Authentication

- JWT signed with HS256.
- Roles: `viewer`, `manager`, `admin`.
- API rate‑limit: 60 req/min per token.

## Observability

- JSON logs → FluentBit → Elasticsearch.
- Prometheus metrics via `/metrics` in each service.

## External dependencies

- FootfallCam API v9 (historical queries & configuration).
- GitHub (repositories, issues).
