import type { ObjectId } from "mongodb";
import type {
  CreateTicketInput,
  PublicTicket,
  TicketDocument,
  UpdateTicketInput,
} from "../type/ticket.js";
import { getTicketsCollection } from "./connection.js";
import { toPublicTicket } from "./mappers.js";

export async function createTicket(
  input: CreateTicketInput
): Promise<PublicTicket> {
  const now = new Date();
  const document: Omit<TicketDocument, "_id"> = {
    customerName: input.customerName,
    email: input.email,
    phone: input.phone,
    title: input.title,
    description: input.description,
    category: input.category,
    priority: input.priority,
    status: "Open",
    createdAt: now,
    updatedAt: now,
  };

  const result = await getTicketsCollection().insertOne(document);
  const created = await getTicketsCollection().findOne({ _id: result.insertedId });
  if (!created) {
    throw new Error("Failed to read the created ticket");
  }
  return toPublicTicket(created);
}

export async function findAllTickets(): Promise<PublicTicket[]> {
  const documents = await getTicketsCollection()
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return documents.map(toPublicTicket);
}

export async function findTicketById(
  id: ObjectId
): Promise<PublicTicket | null> {
  const document = await getTicketsCollection().findOne({ _id: id });
  return document ? toPublicTicket(document) : null;
}

export async function updateTicketById(
  id: ObjectId,
  input: UpdateTicketInput
): Promise<PublicTicket | null> {
  const result = await getTicketsCollection().findOneAndUpdate(
    { _id: id },
    {
      $set: {
        ...input,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  return result ? toPublicTicket(result) : null;
}

export async function deleteTicketById(id: ObjectId): Promise<boolean> {
  const result = await getTicketsCollection().deleteOne({ _id: id });
  return result.deletedCount === 1;
}

export function ticketsToCsv(tickets: PublicTicket[]): string {
  const headers = [
    "Ticket ID",
    "Title",
    "Customer Name",
    "Email",
    "Phone",
    "Category",
    "Priority",
    "Status",
    "Description",
    "Created At",
    "Updated At",
  ];

  const rows = tickets.map((ticket) => [
    ticket.id,
    ticket.title,
    ticket.customerName,
    ticket.email,
    ticket.phone,
    ticket.category,
    ticket.priority,
    ticket.status,
    ticket.description,
    ticket.createdAt,
    ticket.updatedAt,
  ]);

  const escapeCell = (value: string): string => {
    if (/[",\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  return [headers, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\n");
}
