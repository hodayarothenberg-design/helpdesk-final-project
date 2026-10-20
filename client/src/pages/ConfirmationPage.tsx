import { Link, useLocation } from "react-router-dom";

interface ConfirmationState {
  ticketId?: string;
}

export function ConfirmationPage() {
  const location = useLocation();
  const state = (location.state ?? {}) as ConfirmationState;

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
        Ticket received
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">
        Your support ticket was submitted successfully
      </h1>
      <p className="mt-3 text-slate-600">
        The request was saved and opened with status Open. Our team can now review it from the admin area.
      </p>
      {state.ticketId ? (
        <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
          Ticket ID: {state.ticketId}
        </p>
      ) : null}
      <Link
        to="/"
        className="mt-6 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Submit another ticket
      </Link>
    </section>
  );
}
