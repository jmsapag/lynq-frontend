import { useState, useEffect } from "react";
import {
  PaymentIntegration,
  CreatePaymentIntegrationInput,
  UpdatePaymentIntegrationInput,
  TestPaymentConnectionInput,
  PaymentIntegrationsService,
  PaymentProviderType,
} from "../types/payment-integration";

// Mock implementation of the payment integrations service
class PaymentIntegrationsServiceMock implements PaymentIntegrationsService {
  private static mockData: PaymentIntegration[] = [
    {
      id: 1,
      provider: "mercadopago",
      name: "MercadoPago Production",
      config: {
        accessToken: "APP_USR-****-****",
        publicKey: "APP_USR-****-****",
        testMode: false,
        webhookUrl: "https://api.lynq.io/webhooks/mercadopago",
      },
      status: "active",
      isTestMode: false,
      businessId: 1,
      createdAt: "2025-01-10T10:00:00Z",
      updatedAt: "2025-01-10T10:00:00Z",
      lastTestedAt: "2025-01-10T10:00:00Z",
      testResults: {
        success: true,
        message: "Connection successful",
        testedAt: "2025-01-10T10:00:00Z",
      },
    },
  ];

  async list(businessId: string): Promise<PaymentIntegration[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return PaymentIntegrationsServiceMock.mockData.filter(
      (integration) => integration.businessId === parseInt(businessId),
    );
  }

  async get(businessId: string, id: number): Promise<PaymentIntegration> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const integration = PaymentIntegrationsServiceMock.mockData.find(
      (i) => i.id === id && i.businessId === parseInt(businessId),
    );

    if (!integration) {
      throw new Error("Payment integration not found");
    }

    return integration;
  }

  async create(
    businessId: string,
    input: CreatePaymentIntegrationInput,
  ): Promise<PaymentIntegration> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newIntegration: PaymentIntegration = {
      id:
        Math.max(
          ...PaymentIntegrationsServiceMock.mockData.map((i) => i.id),
          0,
        ) + 1,
      provider: input.provider,
      name: input.name,
      config: input.config,
      status: "inactive",
      isTestMode: input.isTestMode || false,
      businessId: parseInt(businessId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    PaymentIntegrationsServiceMock.mockData.push(newIntegration);
    return newIntegration;
  }

  async update(
    businessId: string,
    id: number,
    input: UpdatePaymentIntegrationInput,
  ): Promise<PaymentIntegration> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const index = PaymentIntegrationsServiceMock.mockData.findIndex(
      (i) => i.id === id && i.businessId === parseInt(businessId),
    );

    if (index === -1) {
      throw new Error("Payment integration not found");
    }

    const updated = {
      ...PaymentIntegrationsServiceMock.mockData[index],
      ...input,
      config: {
        ...PaymentIntegrationsServiceMock.mockData[index].config,
        ...input.config,
      },
      updatedAt: new Date().toISOString(),
    };

    PaymentIntegrationsServiceMock.mockData[index] = updated;
    return updated;
  }

  async delete(businessId: string, id: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = PaymentIntegrationsServiceMock.mockData.findIndex(
      (i) => i.id === id && i.businessId === parseInt(businessId),
    );

    if (index === -1) {
      throw new Error("Payment integration not found");
    }

    PaymentIntegrationsServiceMock.mockData.splice(index, 1);
  }

  async testConnection(
    businessId: string,
    input: TestPaymentConnectionInput,
  ): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock testing logic based on provider
    const hasRequiredCredentials = this.validateCredentials(
      input.provider,
      input.config,
    );

    if (!hasRequiredCredentials) {
      return {
        success: false,
        message: "Missing required credentials for the selected provider",
      };
    }

    // Simulate random success/failure for testing
    const success = Math.random() > 0.2; // 80% success rate

    return {
      success,
      message: success
        ? `Connection to ${input.provider} established successfully`
        : `Failed to connect to ${input.provider}. Please verify your credentials.`,
    };
  }

  async activate(businessId: string, id: number): Promise<PaymentIntegration> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return this.update(businessId, id, { status: "active" });
  }

  async deactivate(
    businessId: string,
    id: number,
  ): Promise<PaymentIntegration> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return this.update(businessId, id, { status: "inactive" });
  }

  private validateCredentials(
    provider: PaymentProviderType,
    config: any,
  ): boolean {
    switch (provider) {
      case "mercadopago":
        return !!(config.accessToken && config.publicKey);
      case "stripe":
        return !!(config.secretKey && config.publishableKey);
      case "paypal":
        return !!(config.clientId && config.clientSecret);
      case "other":
        return !!config.apiKey;
      default:
        return false;
    }
  }
}

// Hook for managing payment integrations
export function usePaymentIntegrations(businessId: string) {
  const [integrations, setIntegrations] = useState<PaymentIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const service = new PaymentIntegrationsServiceMock();

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.list(businessId);
      setIntegrations(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch payment integrations",
      );
    } finally {
      setLoading(false);
    }
  };

  const createIntegration = async (
    input: CreatePaymentIntegrationInput,
  ): Promise<PaymentIntegration> => {
    try {
      const newIntegration = await service.create(businessId, input);
      setIntegrations((prev) => [...prev, newIntegration]);
      return newIntegration;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to create payment integration",
      );
    }
  };

  const updateIntegration = async (
    id: number,
    input: UpdatePaymentIntegrationInput,
  ): Promise<PaymentIntegration> => {
    try {
      const updated = await service.update(businessId, id, input);
      setIntegrations((prev) => prev.map((i) => (i.id === id ? updated : i)));
      return updated;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to update payment integration",
      );
    }
  };

  const deleteIntegration = async (id: number): Promise<void> => {
    try {
      await service.delete(businessId, id);
      setIntegrations((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to delete payment integration",
      );
    }
  };

  const testConnection = async (
    input: TestPaymentConnectionInput,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      return await service.testConnection(businessId, input);
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to test connection",
      );
    }
  };

  const activateIntegration = async (
    id: number,
  ): Promise<PaymentIntegration> => {
    try {
      const updated = await service.activate(businessId, id);
      setIntegrations((prev) => prev.map((i) => (i.id === id ? updated : i)));
      return updated;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to activate payment integration",
      );
    }
  };

  const deactivateIntegration = async (
    id: number,
  ): Promise<PaymentIntegration> => {
    try {
      const updated = await service.deactivate(businessId, id);
      setIntegrations((prev) => prev.map((i) => (i.id === id ? updated : i)));
      return updated;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to deactivate payment integration",
      );
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchIntegrations();
    }
  }, [businessId]);

  return {
    integrations,
    loading,
    error,
    refetch: fetchIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testConnection,
    activateIntegration,
    deactivateIntegration,
  };
}
