import type { Ticket } from "../types/ticket";
import { formatDateTime } from "../lib/format";
import { Badge } from "./Badge";

interface TicketCardProps {
  ticket: Ticket;
  onView: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
}

export function TicketCard({ ticket, onView, onDelete }: TicketCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{ticket.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{ticket.customerName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge value={ticket.category} />
          <Badge value={ticket.priority} />
          <Badge value={ticket.status} />
        </div>
      </div>
      <p className="text-xs text-slate-500">Created {formatDateTime(ticket.createdAt)}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onView(ticket)}
          className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-500"
        >
          View details
        </button>
        <button
          type="button"
          onClick={() => onDelete(ticket)}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
