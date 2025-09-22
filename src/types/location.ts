export interface Location {
  id: number;
  name: string;
  address: string;
  created_at: string;
  business_id: number;
}

export interface LocationWithUsers extends Location {
  users: User[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  business_id: number;
}

export interface UserWithLocations {
  id: number;
  name: string;
  email: string;
  role: string;
  locations: {
    id: number;
    name: string;
  }[];
}

// Operating hours types
export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface TimeRange {
  start: string; // HH:mm in local timezone
  end: string; // HH:mm in local timezone
}

export interface DayOperatingHours {
  // Backend model uses isOpen + timeSlots. We normalize to ranges for UI.
  isOpen?: boolean;
  ranges?: TimeRange[]; // UI-friendly alias of backend timeSlots
  // Accept backend field in data coming from API
  timeSlots?: TimeRange[];
}

export interface OperatingHours {
  timezone?: string; // IANA
  monday?: DayOperatingHours;
  tuesday?: DayOperatingHours;
  wednesday?: DayOperatingHours;
  thursday?: DayOperatingHours;
  friday?: DayOperatingHours;
  saturday?: DayOperatingHours;
  sunday?: DayOperatingHours;
  // Optional: exceptions support (frontend only unless backend handles it)
  exceptions?: Array<{
    startDate: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    closedAllDay?: boolean;
    ranges?: TimeRange[];
  }>;
}

export interface LocationWithOperatingHours extends Location {
  operating_hours?: OperatingHours | Record<string, unknown>;
}
