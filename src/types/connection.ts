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
  | "FootfallCamV9API"
  | "Other";

// Provider-specific authentication parameters
export interface AuthParams {
  user?: string;
  password?: string;
}

export interface Connection extends BaseConnection {
  id: number;
  name: string;
  provider: ProviderType;
  authParams: AuthParams; // user, password
  exportUrl?: string; // for FootfallCam
}

export interface CreateConnectionInput {
  name: string;
  provider: ProviderType;
  businessId: number;
  authParams: AuthParams;
  exportUrl?: string;
}

export interface UpdateConnectionInput {
  name?: string;
  authParams?: Partial<AuthParams>;
  exportUrl?: string;
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
  return provider === "FootfallCamV9API";
};

export const isBasicAuthProvider = (provider: ProviderType): boolean => {
  return !isFootfallCamV9Provider(provider);
};

export function getProviderAuthFields(provider: ProviderType): Array<{
  key: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
}> {
  switch (provider) {
    case "FootfallCamV9API":
      return [
        {
          key: "user",
          label: "User",
          type: "text",
          placeholder: "Enter FootfallCam username",
          required: true,
        },
        {
          key: "password",
          label: "Password",
          type: "password",
          placeholder: "Enter FootfallCam password",
          required: true,
        },
      ];
    default:
      return [];
  }
}

export function createAuthParams(provider: ProviderType, fields: Record<string, string>): AuthParams {
  const authParams: AuthParams = {};
  const authFields = getProviderAuthFields(provider);
  
  for (const field of authFields) {
    if (fields[field.key]) {
      authParams[field.key as keyof AuthParams] = fields[field.key];
    }
  }

  return authParams;
}

export const getProviderDisplayName = (provider: ProviderType): string => {
  switch (provider) {
    case "FootfallCamV9API":
      return "FootfallCam V9 API";
    default:
      return provider;
  }
};
