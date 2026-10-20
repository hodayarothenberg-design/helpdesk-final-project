import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { DeleteTicketDialog } from "../components/DeleteTicketDialog";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loading } from "../components/Loading";
import { SelectField } from "../components/SelectField";
import { TicketCard } from "../components/TicketCard";
import { TicketDetailsDialog } from "../components/TicketDetailsDialog";
import { exportTicketsCsv, getTickets } from "../services/ticketService";
import { ApiRequestError } from "../types/api";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type Ticket,
  type TicketCategory,
  type TicketFilters,
  type TicketPriority,
  type TicketStatus,
} from "../types/ticket";

const DEFAULT_FILTERS: TicketFilters = {
  status: "All",
  priority: "All",
  category: "All",
};

function matchesSearch(ticket: Ticket, query: string): boolean {
  if (!query) {
    return true;
  }
  const haystack = `${ticket.title} ${ticket.customerName} ${ticket.email}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function matchesFilters(ticket: Ticket, filters: TicketFilters): boolean {
  if (filters.status !== "All" && ticket.status !== filters.status) {
    return false;
  }
  if (filters.priority !== "All" && ticket.priority !== filters.priority) {
    return false;
  }
  if (filters.category !== "All" && ticket.category !== filters.category) {
    return false;
  }
  return true;
}

export function TicketsPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<TicketFilters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void getTickets(token)
      .then((data) => {
        if (!cancelled) {
          setTickets(data);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          const message =
            caught instanceof ApiRequestError
              ? caught.message
              : "Unable to load tickets";
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const visibleTickets = useMemo(() => {
    return tickets.filter(
      (ticket) => matchesSearch(ticket, search.trim()) && matchesFilters(ticket, filters)
    );
  }, [tickets, search, filters]);

  const handleUpdated = (updated: Ticket): void => {
    setTickets((current) =>
      current.map((ticket) => (ticket.id === updated.id ? updated : ticket))
    );
  };

  const handleDeleted = (ticketId: string): void => {
    setTickets((current) => current.filter((ticket) => ticket.id !== ticketId));
  };

  const handleExport = async (): Promise<void> => {
    if (!token) {
      return;
    }
    setExporting(true);
    try {
      const blob = await exportTicketsCsv(token);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "tickets.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Unable to export tickets");
    } finally {
      setExporting(false);
    }
  };

  const hasActiveQuery = search.trim().length > 0 || filters.status !== "All" || filters.priority !== "All" || filters.category !== "All";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ticket management</h1>
          <p className="mt-1 text-slate-600">Search, filter, update and export support tickets.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            void handleExport();
          }}
          disabled={exporting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-4">
        <label className="flex flex-col gap-1.5 lg:col-span-1">
          <span className="text-sm font-medium text-slate-700">Search</span>
          <input
            value={search}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
            placeholder="Title, customer or email"
            className="h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none ring-brand-500 focus:ring-2"
          />
        </label>
        <SelectField
          id="filter-status"
          label="Status"
          value={filters.status}
          placeholder="All"
          options={[
            { value: "All", label: "All" },
            ...TICKET_STATUSES.map((item) => ({ value: item, label: item })),
          ]}
          onChange={(value) =>
            setFilters((current) => ({ ...current, status: value as TicketStatus | "All" }))
          }
        />
        <SelectField
          id="filter-priority"
          label="Priority"
          value={filters.priority}
          placeholder="All"
          options={[
            { value: "All", label: "All" },
            ...TICKET_PRIORITIES.map((item) => ({ value: item, label: item })),
          ]}
          onChange={(value) =>
            setFilters((current) => ({
              ...current,
              priority: value as TicketPriority | "All",
            }))
          }
        />
        <SelectField
          id="filter-category"
          label="Category"
          value={filters.category}
          placeholder="All"
          options={[
            { value: "All", label: "All" },
            ...TICKET_CATEGORIES.map((item) => ({ value: item, label: item })),
          ]}
          onChange={(value) =>
            setFilters((current) => ({
              ...current,
              category: value as TicketCategory | "All",
            }))
          }
        />
      </div>

      {loading ? <Loading message="Loading tickets..." /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      {!loading && !error && tickets.length === 0 ? (
        <EmptyState title="No support tickets were found" />
      ) : null}

      {!loading && !error && tickets.length > 0 && visibleTickets.length === 0 ? (
        <EmptyState title="No tickets match the current search and filters" />
      ) : null}

      {!loading && visibleTickets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onView={(selected) => {
                setSelectedId(selected.id);
                setDetailsOpen(true);
              }}
              onDelete={setTicketToDelete}
            />
          ))}
        </div>
      ) : null}

      {!loading && tickets.length > 0 ? (
        <p className="text-xs text-slate-500">
          Showing {visibleTickets.length} of {tickets.length}
          {hasActiveQuery ? " matching tickets" : " tickets"}
        </p>
      ) : null}

      <TicketDetailsDialog
        ticketId={selectedId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onUpdated={handleUpdated}
      />
      <DeleteTicketDialog
        ticket={ticketToDelete}
        open={ticketToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setTicketToDelete(null);
          }
        }}
        onDeleted={handleDeleted}
      />
    </section>
  );
}
