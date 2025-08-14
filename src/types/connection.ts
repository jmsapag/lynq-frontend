// Provider types
export type ProviderType = 
  | "PostgreSQL"
  | "MySQL" 
  | "SQLite"
  | "MongoDB"
  | "Redis"
  | "REST API"
  | "GraphQL API"
  | "MQTT"
  | "FTP"
  | "SFTP"
  | "FootfallCam V9 API"
  | "Other";

// Provider-specific authentication parameters
export interface BaseAuthParams {
  user: string;
  password: string;
}

export interface FootfallCamV9AuthParams {
  apiKey: string;
  baseUrl: string;
  version?: string;
}

export type AuthParams = BaseAuthParams | FootfallCamV9AuthParams;

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
  testConnection(businessId: string, input: CreateConnectionInput): Promise<boolean>;
  create(businessId: string, input: CreateConnectionInput): Promise<Connection>;
  update(businessId: string, id: number, input: UpdateConnectionInput): Promise<Connection>;
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
  provider: ProviderType,
  data: Record<string, string>
): AuthParams => {
  if (isFootfallCamV9Provider(provider)) {
    return {
      apiKey: data.apiKey || "",
      baseUrl: data.baseUrl || "",
      version: data.version || "v9",
    } as FootfallCamV9AuthParams;
  }
  
  return {
    user: data.user || "",
    password: data.password || "",
  } as BaseAuthParams;
};

export const getProviderDisplayName = (provider: ProviderType): string => {
  switch (provider) {
    case "FootfallCam V9 API":
      return "FootfallCam V9 API";
    case "REST API":
      return "REST API";
    case "GraphQL API":
      return "GraphQL API";
    default:
      return provider;
  }
};

export const getProviderAuthFields = (provider: ProviderType): Array<{
  key: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
}> => {
  if (isFootfallCamV9Provider(provider)) {
    return [
      {
        key: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "Enter FootfallCam API key",
        required: true,
      },
      {
        key: "baseUrl",
        label: "Base URL",
        type: "url",
        placeholder: "https://api.footfallcam.com",
        required: true,
      },
      {
        key: "version",
        label: "API Version",
        type: "text",
        placeholder: "v9",
        required: false,
      },
    ];
  }
  
  return [
    {
      key: "user",
      label: "Username",
      type: "text",
      placeholder: "Enter username",
      required: true,
    },
    {
      key: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter password",
      required: true,
    },
  ];
};
