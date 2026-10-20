import jwt from "jsonwebtoken";
import type { AuthPayload } from "../type/admin.js";

export function signAuthToken(
  payload: AuthPayload,
  secret: string
): string {
  return jwt.sign(payload, secret, { expiresIn: "8h" });
}

export function verifyAuthToken(
  token: string,
  secret: string
): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, secret);
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      typeof decoded.adminId === "string" &&
      typeof decoded.username === "string"
    ) {
      return {
        adminId: decoded.adminId,
        username: decoded.username,
      };
    }
    return null;
  } catch {
    return null;
  }
}
