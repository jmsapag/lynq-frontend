import { useState, useEffect } from "react";
import { 
  Connection, 
  CreateConnectionInput, 
  UpdateConnectionInput, 
  ConnectionsService,
  ProviderType,
  BaseAuthParams,
  FootfallCamV9AuthParams
} from "../types/connection";

// Mock implementation of the connections service
class MockConnectionsService implements ConnectionsService {
  private connections: Connection[] = [
    {
      id: 1,
      name: "Main Database Connection",
      provider: "PostgreSQL" as ProviderType,
      authParams: {
        user: "admin",
        password: "***hidden***",
      } as BaseAuthParams,
      businessId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Legacy fields for backward compatibility
      user: "admin",
      password: "***hidden***",
    },
    {
      id: 2,
      name: "Analytics API",
      provider: "REST API" as ProviderType,
      authParams: {
        user: "api_user",
        password: "***hidden***",
      } as BaseAuthParams,
      businessId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Legacy fields for backward compatibility
      user: "api_user",
      password: "***hidden***",
    },
    {
      id: 3,
      name: "Customer Database",
      provider: "MySQL" as ProviderType,
      authParams: {
        user: "customer_admin",
        password: "***hidden***",
      } as BaseAuthParams,
      businessId: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Legacy fields for backward compatibility
      user: "customer_admin",
      password: "***hidden***",
    },
    {
      id: 4,
      name: "Payment Gateway",
      provider: "REST API" as ProviderType,
      authParams: {
        user: "payment_service",
        password: "***hidden***",
      } as BaseAuthParams,
      businessId: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Legacy fields for backward compatibility
      user: "payment_service",
      password: "***hidden***",
    },
    {
      id: 5,
      name: "Inventory System",
      provider: "MongoDB" as ProviderType,
      authParams: {
        user: "inventory_user",
        password: "***hidden***",
      } as BaseAuthParams,
      businessId: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Legacy fields for backward compatibility
      user: "inventory_user",
      password: "***hidden***",
    },
    {
      id: 6,
      name: "FootfallCam Store Analytics",
      provider: "FootfallCam V9 API" as ProviderType,
      authParams: {
        apiKey: "***hidden***",
        baseUrl: "https://api.footfallcam.com",
        version: "v9",
      } as FootfallCamV9AuthParams,
      businessId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  async testConnection(_businessId: string, input: CreateConnectionInput): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulate a successful connection test based on authParams
    if (input.provider === "FootfallCam V9 API") {
      const authParams = input.authParams as FootfallCamV9AuthParams;
      return !!(authParams.apiKey && authParams.baseUrl);
    } else {
      const authParams = input.authParams as BaseAuthParams;
      return !!(authParams.user && authParams.password);
    }
  }
  async list(businessId: string): Promise<Connection[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.connections.filter(conn => conn.businessId === parseInt(businessId));
  }

  async create(businessId: string, input: CreateConnectionInput): Promise<Connection> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newConnection: Connection = {
      id: Math.max(...this.connections.map(c => c.id), 0) + 1,
      ...input,
      businessId: parseInt(businessId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.connections.push(newConnection);
    return newConnection;
  }

  async update(_businessId: string, id: number, input: UpdateConnectionInput): Promise<Connection> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.connections.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error("Connection not found");
    }
    
    const existingConnection = this.connections[index];
    
    // Handle authParams update properly
    let updatedAuthParams = existingConnection.authParams;
    if (input.authParams) {
      if (existingConnection.provider === "FootfallCam V9 API") {
        updatedAuthParams = {
          ...(existingConnection.authParams as FootfallCamV9AuthParams),
          ...(input.authParams as Partial<FootfallCamV9AuthParams>)
        } as FootfallCamV9AuthParams;
      } else {
        updatedAuthParams = {
          ...(existingConnection.authParams as BaseAuthParams),
          ...(input.authParams as Partial<BaseAuthParams>)
        } as BaseAuthParams;
      }
    }
    
    this.connections[index] = {
      ...existingConnection,
      ...input,
      authParams: updatedAuthParams,
      updatedAt: new Date().toISOString(),
    };
    return this.connections[index];
  }

  async delete(_businessId: string, id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.connections.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error("Connection not found");
    }
    this.connections.splice(index, 1);
  }
}

const connectionsService = new MockConnectionsService();

export function useConnections(businessId: string) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // List connections
  const listConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await connectionsService.list(businessId);
      setConnections(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  // Create connection
  const createConnection = async (input: CreateConnectionInput): Promise<Connection | null> => {
    try {
      setError(null);
      const newConnection = await connectionsService.create(businessId, input);
      setConnections(prev => [...prev, newConnection]);
      return newConnection;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create connection");
      return null;
    }
  };

  // Update connection
  const updateConnection = async (id: number, input: UpdateConnectionInput): Promise<Connection | null> => {
    try {
      setError(null);
      const updatedConnection = await connectionsService.update(businessId, id, input);
      setConnections(prev => prev.map(c => c.id === id ? updatedConnection : c));
      return updatedConnection;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update connection");
      return null;
    }
  };

  // Delete connection
  const deleteConnection = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await connectionsService.delete(businessId, id);
      setConnections(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete connection");
      return false;
    }
  };

  // Test connection
  const testConnection = async (input: CreateConnectionInput): Promise<boolean> => {
    try {
      setError(null);
      const result = await connectionsService.testConnection(businessId, input);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to test connection");
      return false;
    }
  };

  useEffect(() => {
    if (businessId) {
      listConnections();
    }
  }, [businessId]);

  return {
    connections,
    loading,
    error,
    listConnections,
    createConnection,
    updateConnection,
    deleteConnection,
    testConnection,
  };
}
