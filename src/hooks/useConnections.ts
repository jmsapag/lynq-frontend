import { useState, useEffect } from "react";
import {
  Connection,
  CreateConnectionInput,
  UpdateConnectionInput,
  ConnectionsService,
} from "../types/connection";
import { axiosPrivate } from "../services/axiosClient";
import axios from "axios";

// Real implementation of the connections service using the API
class ConnectionsServiceImpl implements ConnectionsService {
  async testConnection(
    businessId: string,
    input: CreateConnectionInput,
  ): Promise<boolean> {
    try {
      const response = await axiosPrivate.post(`/connections/test`, {
        ...input,
        businessId: parseInt(businessId),
      });
      return response.data.success === true;
    } catch (error) {
      console.error("Error testing connection:", error);
      return false;
    }
  }

  async list(businessId: string): Promise<Connection[]> {
    try {
      const response = await axiosPrivate.get(
        `/connections/business/${businessId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching connections:", error);
      throw new Error("Failed to fetch connections");
    }
  }

  async create(
    businessId: string,
    input: CreateConnectionInput,
  ): Promise<Connection> {
    try {
      const response = await axiosPrivate.post(`/connections`, {
        ...input,
        businessId: parseInt(businessId),
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        throw new Error("A connection with these credentials already exists.");
      }
      console.error("Error creating connection:", error);
      throw new Error("Failed to create connection");
    }
  }

  async update(
    _businessId: string,
    id: number,
    input: UpdateConnectionInput,
  ): Promise<Connection> {
    try {
      const response = await axiosPrivate.put(`/connections/${id}`, input);
      return response.data;
    } catch (error) {
      console.error("Error updating connection:", error);
      throw new Error("Failed to update connection");
    }
  }

  async delete(_businessId: string, id: number): Promise<void> {
    try {
      await axiosPrivate.delete(`/connections/${id}`);
    } catch (error) {
      console.error("Error deleting connection:", error);
      throw new Error("Failed to delete connection");
    }
  }
}

const connectionsService = new ConnectionsServiceImpl();

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
      setError(
        err instanceof Error ? err.message : "Failed to load connections",
      );
    } finally {
      setLoading(false);
    }
  };

  // Create connection
  const createConnection = async (
    input: CreateConnectionInput,
  ): Promise<Connection | null> => {
    try {
      setError(null);
      const newConnection = await connectionsService.create(businessId, input);
      setConnections((prev) => [...prev, newConnection]);
      return newConnection;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create connection";
      setError(errorMessage);
      throw err;
    }
  };

  // Update connection
  const updateConnection = async (
    id: number,
    input: UpdateConnectionInput,
  ): Promise<Connection | null> => {
    try {
      setError(null);
      const updatedConnection = await connectionsService.update(
        businessId,
        id,
        input,
      );
      setConnections((prev) =>
        prev.map((c) => (c.id === id ? updatedConnection : c)),
      );
      return updatedConnection;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update connection",
      );
      return null;
    }
  };

  // Delete connection
  const deleteConnection = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await connectionsService.delete(businessId, id);
      setConnections((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete connection",
      );
      return false;
    }
  };

  // Test connection
  const testConnection = async (
    input: CreateConnectionInput,
  ): Promise<boolean> => {
    try {
      setError(null);
      const result = await connectionsService.testConnection(businessId, input);
      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to test connection",
      );
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
