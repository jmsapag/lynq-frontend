# API Integration Guide

This guide covers how to integrate with the LYNQ Backend API, including service layer patterns, authentication, and error handling.

## API Architecture

### Base Configuration

The LYNQ Frontend communicates with the backend through a RESTful API. All API configuration is centralized in the service layer.

```typescript
// src/services/api.ts
import axios from "axios";

// Public API client (for login, public endpoints)
export const axiosPublic = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Private API client (for authenticated endpoints)
export const axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});
```

### Authentication Integration

#### JWT Cookie-Based Authentication

The frontend uses httpOnly cookies for secure token storage:

```typescript
// Authentication interceptor
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
```

#### Token Management

```typescript
// src/hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosPublic.post("/auth/login", {
        email,
        password,
      });

      // JWT is automatically stored in httpOnly cookie
      setUser(response.data.user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await axiosPrivate.post("/auth/logout");
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return { user, isAuthenticated, login, logout };
};
```

## Service Layer Patterns

### Standard Service Structure

Each API domain follows a consistent pattern:

```typescript
// src/services/sensors.ts
import { axiosPrivate } from "./api";
import { SensorData, SensorRecord, SensorFilters } from "../types/sensors";

export class SensorService {
  // Get sensor data with filters
  static async getSensorData(filters: SensorFilters): Promise<SensorData[]> {
    try {
      const response = await axiosPrivate.get("/sensors/data", {
        params: {
          locationId: filters.locationId,
          startDate: filters.startDate?.toISOString(),
          endDate: filters.endDate?.toISOString(),
          interval: filters.interval,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch sensor data: ${error.message}`);
    }
  }

  // Get sensor records (paginated)
  static async getSensorRecords(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<SensorRecord>> {
    const response = await axiosPrivate.get("/sensors/records", {
      params: { page, limit },
    });

    return response.data;
  }

  // Real-time data subscription
  static async getRealtimeData(locationId: number): Promise<SensorData> {
    const response = await axiosPrivate.get(`/sensors/realtime/${locationId}`);
    return response.data;
  }
}
```

### Data Transformation Patterns

#### API Response Transformation

```typescript
// Transform API dates to Date objects
export const transformSensorData = (apiData: any[]): SensorData[] => {
  return apiData.map(item => ({
    ...item,
    timestamp: new Date(item.timestamp),
    createdAt: new Date(item.createdAt)
  }));
};

// Service method with transformation
static async getSensorData(filters: SensorFilters): Promise<SensorData[]> {
  const response = await axiosPrivate.get('/sensors/data', { params: filters });
  return transformSensorData(response.data);
}
```

#### Request Payload Preparation

```typescript
// Convert frontend filters to API format
const prepareFilters = (filters: DashboardFilters) => ({
  locationIds: filters.selectedLocations.map((l) => l.id),
  startDate: filters.dateRange.start.toISOString(),
  endDate: filters.dateRange.end.toISOString(),
  metrics: filters.selectedMetrics,
  aggregation: filters.interval,
});
```

## API Endpoints Reference

### Authentication Endpoints

```typescript
// Login
POST /auth/login
Body: { email: string, password: string }
Response: { user: User, message: string }

// Logout
POST /auth/logout
Response: { message: string }

// Get current user
GET /auth/me
Response: { user: User }
```

### User Management (Admin only)

```typescript
// Get users (with business filtering)
GET /users?page=1&limit=10&businessId=123
Response: { users: User[], total: number, page: number }

// Create user
POST /users
Body: { email: string, name: string, role: UserRole, businessId?: number }

// Update user
PUT /users/:id
Body: { name?: string, role?: UserRole, active?: boolean }

// Delete user
DELETE /users/:id
```

### Location & Business Data

```typescript
// Get businesses (LYNQ_TEAM only)
GET /businesses
Response: { businesses: Business[] }

// Get locations for user's business
GET /locations
Response: { locations: Location[] }

// Get specific location
GET /locations/:id
Response: { location: Location }
```

### Sensor Data

```typescript
// Get sensor data with filters
GET /sensors/data
Params: {
  locationId: number
  startDate: string (ISO)
  endDate: string (ISO)
  interval: '5m' | '1h' | '1d' | '1w' | '1M'
}
Response: { data: SensorData[] }

// Get sensor records (admin)
GET /sensors/records
Params: { page: number, limit: number }
Response: { records: SensorRecord[], total: number }
```

### Reports

```typescript
// Get saved report layouts
GET /reports/layouts
Response: { layouts: ReportLayout[] }

// Save report layout
POST /reports/layouts
Body: { name: string, config: LayoutConfig }

// Generate report
POST /reports/generate
Body: { layoutId: string, dateRange: DateRange }
Response: { reportUrl: string }
```

## Error Handling

### Global Error Interceptor

```typescript
// src/services/api.ts
axiosPrivate.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, data } = error.response || {};

    switch (status) {
      case 401:
        // Unauthorized - clear auth and redirect
        logout();
        toast.error("Session expired. Please login again.");
        break;

      case 403:
        // Forbidden - insufficient permissions
        toast.error("You do not have permission to access this resource.");
        break;

      case 404:
        // Not found
        toast.error(data?.message || "Resource not found.");
        break;

      case 500:
        // Server error
        toast.error("Server error. Please try again later.");
        console.error("API Error:", error);
        break;

      default:
        // Generic error
        toast.error(data?.message || "An unexpected error occurred.");
    }

    return Promise.reject(error);
  },
);
```

### Service-Level Error Handling

```typescript
export class LocationService {
  static async getLocationData(id: number): Promise<Location> {
    try {
      const response = await axiosPrivate.get(`/locations/${id}`);
      return response.data;
    } catch (error) {
      // Let the interceptor handle HTTP errors
      if (error.response) {
        throw error;
      }

      // Handle network/timeout errors
      throw new Error("Network error. Please check your connection.");
    }
  }
}
```

### Component-Level Error Handling

```typescript
// Custom hook with error handling
const useLocationData = (locationId: number) => {
  const [data, setData] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const location = await LocationService.getLocationData(locationId);
        setData(location);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [locationId]);

  return { data, loading, error, refetch: fetchData };
};
```

## Role-Based API Access

### Permission Checking

```typescript
// src/utils/permissions.ts
export const checkApiPermission = (
  endpoint: string,
  method: string,
  userRole: UserRole,
): boolean => {
  const permissions = {
    LYNQ_TEAM: ["*"], // Full access
    ADMIN: [
      "GET /businesses/current",
      "GET /locations",
      "POST /users",
      "PUT /users/*",
      "GET /reports/*",
    ],
    STANDARD: [
      "GET /locations/assigned",
      "GET /sensors/data",
      "GET /reports/layouts",
    ],
  };

  return (
    permissions[userRole]?.some(
      (pattern) =>
        pattern === "*" || matchPattern(pattern, `${method} ${endpoint}`),
    ) || false
  );
};
```

### Role-Based Service Methods

```typescript
export class UserService {
  // Only ADMIN and LYNQ_TEAM can access
  static async getAllUsers(): Promise<User[]> {
    const userRole = getUserRole();
    if (!["ADMIN", "LYNQ_TEAM"].includes(userRole)) {
      throw new Error("Insufficient permissions");
    }

    const response = await axiosPrivate.get("/users");
    return response.data;
  }

  // STANDARD users can only update their own profile
  static async updateUser(userId: number, data: Partial<User>): Promise<User> {
    const currentUser = getCurrentUser();
    const userRole = getUserRole();

    if (userRole === "STANDARD" && currentUser.id !== userId) {
      throw new Error("You can only update your own profile");
    }

    const response = await axiosPrivate.put(`/users/${userId}`, data);
    return response.data;
  }
}
```

## Data Caching Strategies

### Memory Caching

```typescript
// Simple in-memory cache for frequently accessed data
class ApiCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  set(key: string, data: any, ttl: number = 300000) {
    // 5 min default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }
}

const apiCache = new ApiCache();
```

### Service Method with Caching

```typescript
static async getLocations(): Promise<Location[]> {
  const cacheKey = 'locations';
  const cached = apiCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await axiosPrivate.get('/locations');
  const data = response.data;

  apiCache.set(cacheKey, data, 600000); // Cache for 10 minutes
  return data;
}
```

## Real-Time Data Patterns

### Polling for Updates

```typescript
// Custom hook for real-time sensor data
const useRealtimeSensorData = (
  locationId: number,
  intervalMs: number = 30000,
) => {
  const [data, setData] = useState<SensorData[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchLatestData = useCallback(async () => {
    try {
      const latestData = await SensorService.getRealtimeData(locationId);
      setData((prev) => [...prev.slice(-100), latestData]); // Keep last 100 points
    } catch (error) {
      console.error("Failed to fetch realtime data:", error);
    }
  }, [locationId]);

  useEffect(() => {
    fetchLatestData(); // Initial fetch

    intervalRef.current = setInterval(fetchLatestData, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchLatestData, intervalMs]);

  return data;
};
```

## Testing API Integration

### Service Testing

```typescript
// src/services/__tests__/sensors.test.ts
import { vi } from "vitest";
import { SensorService } from "../sensors";
import { axiosPrivate } from "../api";

vi.mock("../api");

describe("SensorService", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch sensor data with correct parameters", async () => {
    const mockData = [{ id: 1, value: 10, timestamp: new Date() }];
    vi.mocked(axiosPrivate.get).mockResolvedValue({ data: mockData });

    const filters = {
      locationId: 1,
      startDate: new Date(),
      endDate: new Date(),
    };
    const result = await SensorService.getSensorData(filters);

    expect(axiosPrivate.get).toHaveBeenCalledWith("/sensors/data", {
      params: expect.objectContaining({
        locationId: 1,
      }),
    });
    expect(result).toEqual(mockData);
  });
});
```

### Hook Testing with API Mocking

```typescript
// src/hooks/__tests__/useSensorData.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useSensorData } from "../useSensorData";
import { SensorService } from "../../services/sensors";

vi.mock("../../services/sensors");

describe("useSensorData", () => {
  it("should return loading state initially", () => {
    const { result } = renderHook(() => useSensorData(1, mockDateRange));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it("should fetch and return sensor data", async () => {
    const mockData = [{ id: 1, value: 10 }];
    vi.mocked(SensorService.getSensorData).mockResolvedValue(mockData);

    const { result } = renderHook(() => useSensorData(1, mockDateRange));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
    });
  });
});
```
