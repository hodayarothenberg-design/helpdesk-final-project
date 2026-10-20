import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { deleteTicket } from "../services/ticketService";
import { ApiRequestError } from "../types/api";
import type { Ticket } from "../types/ticket";
import { ErrorMessage } from "./ErrorMessage";

interface DeleteTicketDialogProps {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (ticketId: string) => void;
}

export function DeleteTicketDialog({
  ticket,
  open,
  onOpenChange,
  onDeleted,
}: DeleteTicketDialogProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (): Promise<void> => {
    if (!ticket || !token) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteTicket(ticket.id, token);
      onDeleted(ticket.id);
      onOpenChange(false);
    } catch (caught: unknown) {
      const message =
        caught instanceof ApiRequestError
          ? caught.message
          : "Unable to delete the ticket";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setError(null);
        }
        onOpenChange(next);
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-slate-900/40" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
          <AlertDialog.Title className="text-lg font-semibold text-slate-900">
            Delete ticket
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-slate-600">
            {ticket
              ? `This will permanently delete "${ticket.title}" opened by ${ticket.customerName}.`
              : "This ticket will be permanently deleted."}
          </AlertDialog.Description>
          {error ? (
            <div className="mt-3">
              <ErrorMessage message={error} />
            </div>
          ) : null}
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
            </AlertDialog.Cancel>
            <button
              type="button"
              onClick={() => {
                void handleDelete();
              }}
              disabled={loading}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
