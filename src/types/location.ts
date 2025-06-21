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
