export const TICKET_CATEGORIES = [
  "Hardware",
  "Software",
  "Network",
  "Account",
  "Other",
] as const;

export const TICKET_PRIORITIES = ["Low", "Medium", "High"] as const;

export const TICKET_STATUSES = ["Open", "In Progress", "Resolved"] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export interface Ticket {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketInput {
  customerName: string;
  email: string;
  phone: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
}

export interface TicketFormState {
  customerName: string;
  email: string;
  phone: string;
  title: string;
  description: string;
  category: TicketCategory | "";
  priority: TicketPriority | "";
}

export type TicketFormErrors = Partial<Record<keyof TicketFormState, string>>;

export interface UpdateTicketInput {
  status?: TicketStatus;
  priority?: TicketPriority;
}

export interface TicketFilters {
  status: TicketStatus | "All";
  priority: TicketPriority | "All";
  category: TicketCategory | "All";
}
