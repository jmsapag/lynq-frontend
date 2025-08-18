// Provider types
export type ProviderType =
  // | "PostgreSQL"
  // | "MySQL"
  // | "SQLite"
  // | "MongoDB"
  // | "Redis"
  // | "REST API"
  // | "GraphQL API"
  // | "MQTT"
  // | "FTP"
  // | "SFTP"
  "FootfallCam V9 API" | "Other";

// Provider-specific authentication parameters
export interface AuthParams {
  user: string;
  password: string;
}

export interface Connection {
  id: number;
  name: string;
  provider: ProviderType;
  authParams: AuthParams;
  businessId: number;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  user?: string;
  password?: string;
}

export interface CreateConnectionInput {
  name: string;
  provider: ProviderType;
  authParams: AuthParams;
  // Legacy fields for backward compatibility
  user?: string;
  password?: string;
}

export interface UpdateConnectionInput {
  name?: string;
  provider?: ProviderType;
  authParams?: Partial<AuthParams>;
  // Legacy fields for backward compatibility
  user?: string;
  password?: string;
}

export interface ConnectionsService {
  list(businessId: string): Promise<Connection[]>;
  testConnection(
    businessId: string,
    input: CreateConnectionInput,
  ): Promise<boolean>;
  create(businessId: string, input: CreateConnectionInput): Promise<Connection>;
  update(
    businessId: string,
    id: number,
    input: UpdateConnectionInput,
  ): Promise<Connection>;
  delete(businessId: string, id: number): Promise<void>;
}

// Utility functions for provider-specific logic
export const isFootfallCamV9Provider = (provider: ProviderType): boolean => {
  return provider === "FootfallCam V9 API";
};

export const isBasicAuthProvider = (provider: ProviderType): boolean => {
  return !isFootfallCamV9Provider(provider);
};

export const createAuthParams = (
  _provider: ProviderType,
  data: Record<string, string>,
): AuthParams => {
  return {
    user: data.user || "",
    password: data.password || "",
  } as AuthParams;
};

export const getProviderDisplayName = (provider: ProviderType): string => {
  switch (provider) {
    case "FootfallCam V9 API":
      return "FootfallCam V9 API";
    default:
      return provider;
  }
};

export const getProviderAuthFields = (
  provider: ProviderType,
): Array<{
  key: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
}> => {
  // All providers currently use the same user/password authentication
  return [
    {
      key: "user",
      label: "Username",
      type: "text",
      placeholder:
        provider === "FootfallCam V9 API"
          ? "Enter FootfallCam username"
          : "Enter username",
      required: true,
    },
    {
      key: "password",
      label: "Password",
      type: "password",
      placeholder:
        provider === "FootfallCam V9 API"
          ? "Enter FootfallCam password"
          : "Enter password",
      required: true,
    },
  ];
};
