// Payment provider types
export type PaymentProviderType = "mercadopago" | "stripe" | "paypal" | "other";

// Provider-specific configuration parameters
export interface PaymentProviderConfig {
  // MercadoPago
  accessToken?: string;
  publicKey?: string;

  // Stripe
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;

  // PayPal
  clientId?: string;
  clientSecret?: string;
  environment?: "sandbox" | "live";

  // Other/Custom
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;

  // Common test parameters
  testMode?: boolean;
  webhookUrl?: string;
}

export interface PaymentIntegration {
  id: number;
  provider: PaymentProviderType;
  name: string;
  config: PaymentProviderConfig;
  status: "active" | "inactive" | "error" | "testing";
  isTestMode: boolean;
  businessId: number;
  createdAt: string;
  updatedAt: string;
  lastTestedAt?: string;
  testResults?: {
    success: boolean;
    message: string;
    testedAt: string;
  };
}

export interface CreatePaymentIntegrationInput {
  provider: PaymentProviderType;
  name: string;
  config: PaymentProviderConfig;
  businessId: number;
  isTestMode?: boolean;
}

export interface UpdatePaymentIntegrationInput {
  name?: string;
  config?: Partial<PaymentProviderConfig>;
  isTestMode?: boolean;
  status?: "active" | "inactive";
}

export interface TestPaymentConnectionInput {
  provider: PaymentProviderType;
  config: PaymentProviderConfig;
  businessId: number;
}

export interface PaymentIntegrationsService {
  list(businessId: string): Promise<PaymentIntegration[]>;
  get(businessId: string, id: number): Promise<PaymentIntegration>;
  create(
    businessId: string,
    input: CreatePaymentIntegrationInput,
  ): Promise<PaymentIntegration>;
  update(
    businessId: string,
    id: number,
    input: UpdatePaymentIntegrationInput,
  ): Promise<PaymentIntegration>;
  delete(businessId: string, id: number): Promise<void>;
  testConnection(
    businessId: string,
    input: TestPaymentConnectionInput,
  ): Promise<{
    success: boolean;
    message: string;
  }>;
  activate(businessId: string, id: number): Promise<PaymentIntegration>;
  deactivate(businessId: string, id: number): Promise<PaymentIntegration>;
}

export interface PaymentProviderMetadata {
  type: PaymentProviderType;
  name: string;
  description: string;
  icon: string;
  requiredFields: {
    field: keyof PaymentProviderConfig;
    label: string;
    type: "text" | "password" | "select" | "url";
    required: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
  }[];
  testingSupported: boolean;
  documentationUrl?: string;
}
