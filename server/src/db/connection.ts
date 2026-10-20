import { MongoClient, type Collection, type Db } from "mongodb";
import type { AdminDocument } from "../type/admin.js";
import type { TicketDocument } from "../type/ticket.js";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(uri: string, dbName: string): Promise<Db> {
  if (db) {
    return db;
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

export function getDb(): Db {
  if (!db) {
    throw new Error("Database is not connected");
  }
  return db;
}

export function getTicketsCollection(): Collection<TicketDocument> {
  return getDb().collection<TicketDocument>("tickets");
}

export function getAdminsCollection(): Collection<AdminDocument> {
  return getDb().collection<AdminDocument>("admins");
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
