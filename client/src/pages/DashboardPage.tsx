import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loading } from "../components/Loading";
import { getTickets } from "../services/ticketService";
import { ApiRequestError } from "../types/api";
import type { Ticket } from "../types/ticket";

interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  highPriority: number;
}

function computeStats(tickets: Ticket[]): DashboardStats {
  return {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "Open").length,
    inProgress: tickets.filter((ticket) => ticket.status === "In Progress").length,
    resolved: tickets.filter((ticket) => ticket.status === "Resolved").length,
    highPriority: tickets.filter((ticket) => ticket.priority === "High").length,
  };
}

export function DashboardPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
              : "Unable to load dashboard data";
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

  const stats = useMemo(() => computeStats(tickets), [tickets]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-600">A live snapshot of the current support queue.</p>
      </div>

      {loading ? <Loading message="Loading dashboard..." /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total Tickets" value={stats.total} />
            <StatCard label="Open" value={stats.open} />
            <StatCard label="In Progress" value={stats.inProgress} />
            <StatCard label="Resolved" value={stats.resolved} />
            <StatCard label="High Priority" value={stats.highPriority} />
          </div>
          <Link
            to="/admin/tickets"
            className="inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Manage tickets
          </Link>
        </>
      ) : null}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </article>
  );
}
