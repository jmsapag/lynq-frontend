# 08_system_flows.md

## Primary ingestion sequence

```
Sensors → MQTT Broker → Normalizer → PostgreSQL → API → Frontend
(Multi-brand)   (Topic-based)   (Brand-specific)  (Role-based)
```

### Step‑by‑step

1. **Publish**  
   Sensors send MQTT messages to brand-specific topics:
   - `xovis` for Xovis sensors
   - `hella` for Hella sensors
   - `footfallcam/+` for FootfallCam sensors (with device ID wildcard)
2. **Receive & parse**  
   Normalizer subscribes to all sensor topics and routes to appropriate controllers:
   - `xovisController` handles Xovis format
   - `hellaController` handles Hella format
   - `footfallCamController` handles FootfallCam format
3. **Transform & persist**  
   Each controller adapts the message format and saves to:
   - `Sensor_Data` table with normalized structure
   - Associated with correct Business → Location → Sensor hierarchy
4. **API access**  
   Role-based endpoints provide data access:
   - `LYNQ_TEAM`: All businesses and locations
   - `ADMIN`: Single business, all locations
   - `STANDARD`: Assigned locations only
5. **Frontend consumption**  
   React frontend fetches data through authenticated API calls with automatic role-based filtering.

## User authentication flow

```
Registration Token → User Registration → Login → JWT → Protected Routes
```

### Authentication sequence

1. **Token Creation**: LYNQ_TEAM creates registration tokens for specific roles and businesses
2. **User Registration**: New users register with valid token, creating account with predefined role
3. **Login**: User provides email/password, receives JWT with role and business information
4. **Route Protection**: All API routes validate JWT and check role permissions
5. **Business Filtering**: Data automatically filtered based on user's business association

## Role-based access patterns

### LYNQ_TEAM access

- **Businesses**: Full CRUD on all businesses
- **Locations**: Access to all locations across all businesses
- **Users**: Manage users in any business
- **Sensors**: Configure and monitor all sensors
- **System**: Administrative functions and monitoring

### ADMIN access

- **Business**: Read/update their own business only
- **Locations**: Full CRUD within their business
- **Users**: Manage users within their business
- **Sensors**: Manage sensors within their business locations
- **Data**: Access all sensor data within their business

### STANDARD access

- **Locations**: Read-only access to assigned locations only
- **Sensors**: View sensors in assigned locations
- **Data**: Access sensor data from assigned locations only
- **Profile**: Update own profile information

## Data aggregation flow

```
Raw Sensor Data → Time-based Grouping → Location Grouping → Business Filtering → API Response
```

### Aggregation process

1. **Time Filtering**: Apply from/to date parameters
2. **Sensor Selection**: Filter by requested sensor IDs
3. **Permission Check**: Verify user access to requested sensors
4. **Data Grouping**: Group by location and time intervals
5. **Response Formatting**: Structure data with location and sensor context

## Error handling patterns

| Component  | Error Type           | Action                         | Recovery               |
| ---------- | -------------------- | ------------------------------ | ---------------------- |
| Normalizer | Invalid JSON         | Log warning, discard message   | Continue processing    |
| Normalizer | Unknown sensor brand | Log error, skip processing     | Monitor for new brands |
| Normalizer | DB connection lost   | Retry with exponential backoff | Queue messages locally |
| API        | Invalid permissions  | Return 403 Forbidden           | User notification      |
| API        | Business not found   | Return 404 Not Found           | Check business ID      |
| Frontend   | Network error        | Show error message, retry      | Automatic reconnection |
| Frontend   | Session expired      | Redirect to login page         | Re-authentication      |

## Device lifecycle management

```
[Inactive] --register--> [Active] --data--> [Monitoring] --disconnect--> [Stale] --reconnect--> [Active]
                                      |                      |
                                      |--maintenance--> [Maintenance]
                                      |                      |
                                      v                      v
                                  [Configured] <--update-- [Configured]
```

### Device states

- **Inactive**: Sensor registered but not sending data
- **Active**: Regular data transmission
- **Monitoring**: Continuous data flow, normal operation
- **Stale**: Missed expected data transmissions
- **Maintenance**: Temporarily offline for servicing
- **Configured**: Updated settings applied

## Business data isolation

```
Request → JWT Validation → Role Check → Business Filter → Location Filter → Data Access
```

### Isolation enforcement

1. **JWT Validation**: Verify token signature and expiration
2. **Role Extraction**: Get user role and business ID from token
3. **Route Authorization**: Check if role can access endpoint
4. **Business Filtering**: Apply business ID filter to all queries
5. **Location Filtering**: For STANDARD users, filter by assigned locations
6. **Data Response**: Return only authorized data subset

## Monitoring and health checks

- **API Health**: `/` endpoint returns service status
- **Database Health**: Prisma connection monitoring
- **MQTT Health**: Client connection status and message flow
- **Sensor Health**: Last activity timestamp tracking
- **Business Metrics**: Data flow per business/location
- **User Activity**: Login patterns and session management
