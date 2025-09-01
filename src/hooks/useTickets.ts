import { useState, useEffect } from "react";
import {
  Ticket,
  CreateTicketInput,
  CreateTicketResponse,
  UpdateTicketInput,
  TicketsService,
} from "../types/ticket";
import { axiosPrivate } from "../services/axiosClient";

// Add this interface for the API response
interface TicketsListResponse {
  tickets: Ticket[];
  total: number;
}

class TicketsServiceImpl implements TicketsService {
  async create(input: CreateTicketInput): Promise<CreateTicketResponse> {
    try {
      const response = await axiosPrivate.post("/api/tickets", input);
      return response.data;
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw new Error("Failed to create ticket");
    }
  }

  // Use real API endpoint for listing tickets
  async list(_businessId: string): Promise<Ticket[]> {
    try {
      const response =
        await axiosPrivate.get<TicketsListResponse>("/api/tickets");
      return response.data.tickets;
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw new Error("Failed to load tickets");
    }
  }

  // Keep mock implementations for other methods
  async update(
    _businessId: string,
    _id: number,
    _input: UpdateTicketInput,
  ): Promise<Ticket> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    throw new Error("Update not implemented yet");
  }

  async delete(_businessId: string, _id: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    throw new Error("Delete not implemented yet");
  }

  async getById(_businessId: string, _id: number): Promise<Ticket> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    throw new Error("Get by ID not implemented yet");
  }
}

const ticketsService = new TicketsServiceImpl();

export function useTickets(businessId: string) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // List tickets
  const listTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await ticketsService.list(businessId);
      setTickets(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  // Create ticket
  const createTicket = async (
    input: CreateTicketInput,
  ): Promise<CreateTicketResponse> => {
    try {
      setError(null);
      const result = await ticketsService.create(input);
      // Refresh list after creating
      await listTickets();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create ticket";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Keep other methods as is for now
  const updateTicket = async (
    id: number,
    input: UpdateTicketInput,
  ): Promise<Ticket> => {
    try {
      setError(null);
      const result = await ticketsService.update(businessId, id, input);
      setTickets((prev) =>
        prev.map((ticket) => (ticket.id === id ? result : ticket)),
      );
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update ticket";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTicket = async (id: number): Promise<void> => {
    try {
      setError(null);
      await ticketsService.delete(businessId, id);
      setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete ticket";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getTicketById = async (id: number): Promise<Ticket> => {
    try {
      setError(null);
      return await ticketsService.getById(businessId, id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get ticket";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    listTickets();
  }, [businessId]);

  return {
    tickets,
    loading,
    error,
    listTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    getTicketById,
  };
}
