import bcrypt from "bcryptjs";
import type { AdminDocument } from "../type/admin.js";
import { getAdminsCollection } from "./connection.js";

export async function findAdminByUsername(
  username: string
): Promise<AdminDocument | null> {
  return getAdminsCollection().findOne({ username });
}

export async function ensureDefaultAdmin(
  username: string,
  password: string
): Promise<void> {
  const existing = await getAdminsCollection().findOne({ username });
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await getAdminsCollection().insertOne({
    username,
    passwordHash,
  });
}

export async function verifyAdminPassword(
  admin: AdminDocument,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, admin.passwordHash);
}
