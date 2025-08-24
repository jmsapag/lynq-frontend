import { useState, useEffect } from "react";
import {
  Ticket,
  CreateTicketInput,
  CreateTicketResponse,
  UpdateTicketInput,
  TicketsService,
} from "../types/ticket";
import { axiosPrivate } from "../services/axiosClient";

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

  // Mock implementation for other operations (to be replaced with real API calls later)
  private mockTickets: Ticket[] = [
    {
      id: 1,
      subject: "Connection Issue",
      description: "Unable to connect to the sensor network",
      status: "open",
      businessId: 1,
      userId: 1,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      subject: "Data Export Problem",
      description: "CSV export is not working properly",
      status: "in_progress",
      businessId: 1,
      userId: 1,
      createdAt: "2024-01-14T14:20:00Z",
      updatedAt: "2024-01-15T09:15:00Z",
    },
  ];

  async list(businessId: string): Promise<Ticket[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return this.mockTickets.filter(
      (ticket) => ticket.businessId === parseInt(businessId),
    );
  }

  async update(
    businessId: string,
    id: number,
    input: UpdateTicketInput,
  ): Promise<Ticket> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const ticketIndex = this.mockTickets.findIndex(
      (ticket) =>
        ticket.id === id && ticket.businessId === parseInt(businessId),
    );

    if (ticketIndex === -1) {
      throw new Error("Ticket not found");
    }

    this.mockTickets[ticketIndex] = {
      ...this.mockTickets[ticketIndex],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    return this.mockTickets[ticketIndex];
  }

  async delete(businessId: string, id: number): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const ticketIndex = this.mockTickets.findIndex(
      (ticket) =>
        ticket.id === id && ticket.businessId === parseInt(businessId),
    );

    if (ticketIndex === -1) {
      throw new Error("Ticket not found");
    }

    this.mockTickets.splice(ticketIndex, 1);
  }

  async getById(businessId: string, id: number): Promise<Ticket> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const ticket = this.mockTickets.find(
      (ticket) =>
        ticket.id === id && ticket.businessId === parseInt(businessId),
    );

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    return ticket;
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
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create ticket";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update ticket
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

  // Delete ticket
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

  // Get ticket by ID
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

  // Load tickets on mount
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
