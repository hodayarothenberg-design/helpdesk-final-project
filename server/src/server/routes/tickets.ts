import { Router, type Request, type Response } from "express";
import { requireAdmin, type AuthenticatedRequest } from "../../auth/middleware.js";
import {
  createTicket,
  deleteTicketById,
  findAllTickets,
  findTicketById,
  ticketsToCsv,
  updateTicketById,
} from "../../db/ticketActions.js";
import type { ApiResponse } from "../../type/api.js";
import type { PublicTicket, TicketIdParams } from "../../type/ticket.js";
import { parseObjectId } from "../../validation/guards.js";
import {
  parseCreateTicketInput,
  parseUpdateTicketInput,
} from "../../validation/ticket.js";

export function createTicketsRouter(jwtSecret: string): Router {
  const router = Router();
  const protect = requireAdmin(jwtSecret);

  router.post(
    "/",
    async (
      req: Request,
      res: Response<ApiResponse<PublicTicket>>
    ): Promise<void> => {
      const parsed = parseCreateTicketInput(req.body);
      if (!parsed.ok) {
        res.status(400).json({ success: false, error: parsed.error });
        return;
      }

      try {
        const ticket = await createTicket(parsed.value);
        res.status(201).json({ success: true, data: ticket });
      } catch {
        res.status(500).json({
          success: false,
          error: "Unable to create the ticket",
        });
      }
    }
  );

  router.get(
    "/",
    protect,
    async (
      _req: AuthenticatedRequest,
      res: Response<ApiResponse<PublicTicket[]>>
    ): Promise<void> => {
      try {
        const tickets = await findAllTickets();
        res.status(200).json({ success: true, data: tickets });
      } catch {
        res.status(500).json({
          success: false,
          error: "Unable to load tickets",
        });
      }
    }
  );

  router.get(
    "/export/csv",
    protect,
    async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const tickets = await findAllTickets();
        const csv = ticketsToCsv(tickets);
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="tickets.csv"'
        );
        res.status(200).send(csv);
      } catch {
        res.status(500).json({
          success: false,
          error: "Unable to export tickets",
        });
      }
    }
  );

  router.get(
    "/:id",
    protect,
    async (
      req: Request<TicketIdParams>,
      res: Response<ApiResponse<PublicTicket>>
    ): Promise<void> => {
      const objectId = parseObjectId(req.params.id);
      if (!objectId) {
        res.status(400).json({ success: false, error: "Invalid ticket id" });
        return;
      }

      try {
        const ticket = await findTicketById(objectId);
        if (!ticket) {
          res.status(404).json({ success: false, error: "Ticket not found" });
          return;
        }
        res.status(200).json({ success: true, data: ticket });
      } catch {
        res.status(500).json({
          success: false,
          error: "Unable to load the ticket",
        });
      }
    }
  );

  router.patch(
    "/:id",
    protect,
    async (
      req: Request<TicketIdParams>,
      res: Response<ApiResponse<PublicTicket>>
    ): Promise<void> => {
      const objectId = parseObjectId(req.params.id);
      if (!objectId) {
        res.status(400).json({ success: false, error: "Invalid ticket id" });
        return;
      }

      const parsed = parseUpdateTicketInput(req.body);
      if (!parsed.ok) {
        res.status(400).json({ success: false, error: parsed.error });
        return;
      }

      try {
        const ticket = await updateTicketById(objectId, parsed.value);
        if (!ticket) {
          res.status(404).json({ success: false, error: "Ticket not found" });
          return;
        }
        res.status(200).json({ success: true, data: ticket });
      } catch {
        res.status(500).json({
          success: false,
          error: "Unable to update the ticket",
        });
      }
    }
  );

  router.delete(
    "/:id",
    protect,
    async (
      req: Request<TicketIdParams>,
      res: Response<ApiResponse<{ deleted: true }>>
    ): Promise<void> => {
      const objectId = parseObjectId(req.params.id);
      if (!objectId) {
        res.status(400).json({ success: false, error: "Invalid ticket id" });
        return;
      }

      try {
        const deleted = await deleteTicketById(objectId);
        if (!deleted) {
          res.status(404).json({ success: false, error: "Ticket not found" });
          return;
        }
        res.status(200).json({ success: true, data: { deleted: true } });
      } catch {
        res.status(500).json({
          success: false,
          error: "Unable to delete the ticket",
        });
      }
    }
  );

  return router;
}
