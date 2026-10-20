import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { getTicketById, updateTicket } from "../services/ticketService";
import type { Ticket, TicketPriority, TicketStatus } from "../types/ticket";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "../types/ticket";
import { formatDateTime } from "../lib/format";
import { ApiRequestError } from "../types/api";
import { Badge } from "./Badge";
import { ErrorMessage } from "./ErrorMessage";
import { Loading } from "./Loading";
import { SelectField } from "./SelectField";

interface TicketDetailsDialogProps {
  ticketId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (ticket: Ticket) => void;
}

export function TicketDetailsDialog({
  ticketId,
  open,
  onOpenChange,
  onUpdated,
}: TicketDetailsDialogProps) {
  const { token } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [status, setStatus] = useState<TicketStatus>("Open");
  const [priority, setPriority] = useState<TicketPriority>("Low");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !ticketId || !token) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setTicket(null);

    void getTicketById(ticketId, token)
      .then((loaded) => {
        if (cancelled) {
          return;
        }
        setTicket(loaded);
        setStatus(loaded.status);
        setPriority(loaded.priority);
      })
      .catch((caught: unknown) => {
        if (cancelled) {
          return;
        }
        const message =
          caught instanceof ApiRequestError
            ? caught.message
            : "Unable to load ticket details";
        setError(message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, ticketId, token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!ticket || !token) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await updateTicket(
        ticket.id,
        { status, priority },
        token
      );
      setTicket(updated);
      onUpdated(updated);
    } catch (caught: unknown) {
      const message =
        caught instanceof ApiRequestError
          ? caught.message
          : "Unable to update the ticket";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(92vw,640px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
          <Dialog.Title className="text-lg font-semibold text-slate-900">
            Ticket details
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-slate-500">
            Full ticket information is loaded from the server by ID.
          </Dialog.Description>

          <div className="mt-4 space-y-4">
            {loading ? <Loading message="Loading ticket..." /> : null}
            {error ? <ErrorMessage message={error} /> : null}
            {ticket ? (
              <>
                <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm">
                  <Detail label="Title" value={ticket.title} />
                  <Detail label="Customer" value={ticket.customerName} />
                  <Detail label="Email" value={ticket.email} />
                  <Detail label="Phone" value={ticket.phone} />
                  <div className="flex flex-wrap gap-2">
                    <Badge value={ticket.category} />
                    <Badge value={ticket.priority} />
                    <Badge value={ticket.status} />
                  </div>
                  <Detail label="Description" value={ticket.description} />
                  <Detail label="Created" value={formatDateTime(ticket.createdAt)} />
                  <Detail label="Updated" value={formatDateTime(ticket.updatedAt)} />
                  <Detail label="ID" value={ticket.id} />
                </div>

                <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
                  <SelectField
                    id="status"
                    label="Status"
                    value={status}
                    placeholder="Select status"
                    options={TICKET_STATUSES.map((item) => ({
                      value: item,
                      label: item,
                    }))}
                    onChange={(value) => setStatus(value as TicketStatus)}
                  />
                  <SelectField
                    id="priority"
                    label="Priority"
                    value={priority}
                    placeholder="Select priority"
                    options={TICKET_PRIORITIES.map((item) => ({
                      value: item,
                      label: item,
                    }))}
                    onChange={(value) => setPriority(value as TicketPriority)}
                  />
                  <div className="sm:col-span-2 flex justify-end gap-2">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                      >
                        Close
                      </button>
                    </Dialog.Close>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </form>
              </>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-slate-800">{value}</p>
    </div>
  );
}
