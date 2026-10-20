import type { PublicTicket, TicketDocument } from "../type/ticket.js";

export function toPublicTicket(document: TicketDocument): PublicTicket {
  return {
    id: document._id.toHexString(),
    customerName: document.customerName,
    email: document.email,
    phone: document.phone,
    title: document.title,
    description: document.description,
    category: document.category,
    priority: document.priority,
    status: document.status,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}
