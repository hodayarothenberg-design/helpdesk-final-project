import type {
  CreateTicketInput,
  Ticket,
  UpdateTicketInput,
} from "../types/ticket";
import { apiRequest, getApiBaseUrl } from "./apiClient";

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  return apiRequest<Ticket>("/tickets", {
    method: "POST",
    body: input,
  });
}

export async function getTickets(token: string): Promise<Ticket[]> {
  return apiRequest<Ticket[]>("/tickets", { token });
}

export async function getTicketById(
  id: string,
  token: string
): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}`, { token });
}

export async function updateTicket(
  id: string,
  input: UpdateTicketInput,
  token: string
): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}`, {
    method: "PATCH",
    body: input,
    token,
  });
}

export async function deleteTicket(id: string, token: string): Promise<void> {
  await apiRequest<{ deleted: true }>(`/tickets/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function exportTicketsCsv(token: string): Promise<Blob> {
  const response = await fetch(`${getApiBaseUrl()}/tickets/export/csv`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to export tickets");
  }

  return response.blob();
}
