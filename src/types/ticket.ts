export interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: TicketStatus;
  businessId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface CreateTicketInput {
  subject: string;
  description: string;
}

export interface UpdateTicketInput {
  subject?: string;
  description?: string;
  status?: TicketStatus;
}

export interface TicketsService {
  list(businessId: string): Promise<Ticket[]>;
  create(businessId: string, input: CreateTicketInput): Promise<Ticket>;
  update(businessId: string, id: number, input: UpdateTicketInput): Promise<Ticket>;
  delete(businessId: string, id: number): Promise<void>;
  getById(businessId: string, id: number): Promise<Ticket>;
}

// Utility functions
export const getTicketStatusDisplayName = (status: TicketStatus): string => {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
    default:
      return status;
  }
};