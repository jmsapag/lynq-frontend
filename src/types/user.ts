// User DTO types for API requests and responses

// DTO for updating user information
export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: "LYNQ_TEAM" | "ADMIN" | "STANDARD";
  business_id?: number;
}

// Response structure when updating a user
export interface UpdateUserResponse {
  id: number;
  name: string;
  email: string;
  role: "LYNQ_TEAM" | "ADMIN" | "STANDARD";
  business_id: number;
  phone?: string;
  // Add any other fields that might be returned by the API
}

// Role type for the application
export type UserRole = "LYNQ_TEAM" | "ADMIN" | "STANDARD";
