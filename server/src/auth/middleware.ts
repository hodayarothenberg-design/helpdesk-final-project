import type { NextFunction, Request, Response } from "express";
import type { ApiResponse } from "../type/api.js";
import type { AuthPayload } from "../type/admin.js";
import { verifyAuthToken } from "./jwt.js";

export interface AuthenticatedRequest extends Request {
  admin?: AuthPayload;
}

export function requireAdmin(secret: string) {
  return (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<never>>,
    next: NextFunction
  ): void => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "Authentication required",
      });
      return;
    }

    const token = header.slice("Bearer ".length).trim();
    const payload = verifyAuthToken(token, secret);
    if (!payload) {
      res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
      return;
    }

    req.admin = payload;
    next();
  };
}
