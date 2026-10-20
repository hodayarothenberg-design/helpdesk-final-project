import type { TicketCategory, TicketPriority, TicketStatus } from "../types/ticket";

interface BadgeProps {
  value: TicketStatus | TicketPriority | TicketCategory;
}

const COLOR_MAP: Record<BadgeProps["value"], string> = {
  Open: "bg-sky-100 text-sky-800",
  "In Progress": "bg-amber-100 text-amber-800",
  Resolved: "bg-emerald-100 text-emerald-800",
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-indigo-100 text-indigo-800",
  High: "bg-rose-100 text-rose-800",
  Hardware: "bg-orange-100 text-orange-800",
  Software: "bg-violet-100 text-violet-800",
  Network: "bg-cyan-100 text-cyan-800",
  Account: "bg-teal-100 text-teal-800",
  Other: "bg-zinc-100 text-zinc-700",
};

export function Badge({ value }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${COLOR_MAP[value]}`}
    >
      {value}
    </span>
  );
}
