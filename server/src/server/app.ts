import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import type { ApiResponse } from "../type/api.js";
import { createAdminRouter } from "./routes/admin.js";
import { createTicketsRouter } from "./routes/tickets.js";

export function createApp(options: {
  clientOrigin: string;
  jwtSecret: string;
}): Express {
  const app = express();

  app.use(
    cors({
      origin: options.clientOrigin,
    })
  );
  app.use(express.json());

  app.get("/api/health", (_req: Request, res: Response<ApiResponse<{ ok: true }>>) => {
    res.status(200).json({ success: true, data: { ok: true } });
  });

  app.use("/api/admin", createAdminRouter(options.jwtSecret));
  app.use("/api/tickets", createTicketsRouter(options.jwtSecret));

  app.use((_req: Request, res: Response<ApiResponse<never>>) => {
    res.status(404).json({ success: false, error: "Route not found" });
  });

  return app;
}
