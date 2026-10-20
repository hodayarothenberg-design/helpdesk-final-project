import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-white/15 text-white"
      : "text-blue-100 hover:bg-white/10 hover:text-white"
  }`;

export function Navbar() {
  const { isAuthenticated, username, logout } = useAuth();

  return (
    <header className="bg-brand-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Help Desk
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          <NavLink to="/" className={linkClass} end>
            New Ticket
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/admin/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/tickets" className={linkClass}>
                Tickets
              </NavLink>
              <span className="hidden text-xs text-blue-200 sm:inline">
                {username}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-blue-50"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-blue-50"
            >
              Admin Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
