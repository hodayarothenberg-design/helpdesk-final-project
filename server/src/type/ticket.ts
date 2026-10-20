import type { ObjectId } from "mongodb";

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

export interface TicketDocument {
  _id: ObjectId;
  customerName: string;
  email: string;
  phone: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicTicket {
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

export interface UpdateTicketInput {
  status?: TicketStatus;
  priority?: TicketPriority;
}

export interface TicketIdParams {
  id: string;
}
