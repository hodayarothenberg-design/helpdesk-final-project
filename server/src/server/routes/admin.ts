import { Router, type Request, type Response } from "express";
import { findAdminByUsername, verifyAdminPassword } from "../../db/adminActions.js";
import { signAuthToken } from "../../auth/jwt.js";
import type { ApiResponse } from "../../type/api.js";
import type { LoginResult } from "../../type/admin.js";
import { parseLoginInput } from "../../validation/ticket.js";

export function createAdminRouter(jwtSecret: string): Router {
  const router = Router();

  router.post(
    "/login",
    async (
      req: Request,
      res: Response<ApiResponse<LoginResult>>
    ): Promise<void> => {
      const parsed = parseLoginInput(req.body);
      if (!parsed.ok) {
        res.status(400).json({ success: false, error: parsed.error });
        return;
      }

      try {
        const admin = await findAdminByUsername(parsed.value.username);
        if (!admin) {
          res.status(401).json({
            success: false,
            error: "Invalid username or password",
          });
          return;
        }

        const matches = await verifyAdminPassword(admin, parsed.value.password);
        if (!matches) {
          res.status(401).json({
            success: false,
            error: "Invalid username or password",
          });
          return;
        }

        const token = signAuthToken(
          {
            adminId: admin._id.toHexString(),
            username: admin.username,
          },
          jwtSecret
        );

        res.status(200).json({
          success: true,
          data: {
            token,
            admin: {
              id: admin._id.toHexString(),
              username: admin.username,
            },
          },
        });
      } catch {
        res.status(500).json({
          success: false,
          error: "Unable to complete login",
        });
      }
    }
  );

  return router;
}
