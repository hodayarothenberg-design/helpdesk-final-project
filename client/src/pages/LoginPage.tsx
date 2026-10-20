import { useState, type ChangeEvent, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ErrorMessage } from "../components/ErrorMessage";
import { loginAdmin } from "../services/authService";
import { ApiRequestError } from "../types/api";

interface LoginFormState {
  username: string;
  password: string;
}

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginFormState>({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const field = event.target.name as keyof LoginFormState;
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (!form.username.trim() || !form.password.trim()) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);
    try {
      const result = await loginAdmin({
        username: form.username.trim(),
        password: form.password,
      });
      login(result.token, result.admin.username);
      navigate("/admin/dashboard", { replace: true });
    } catch (caught: unknown) {
      const message =
        caught instanceof ApiRequestError
          ? caught.message
          : "Unable to complete login";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Admin login</h1>
        <p className="mt-2 text-sm text-slate-600">
          Only administrators can view and manage support tickets.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error ? <ErrorMessage message={error} /> : null}
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Username</span>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none ring-brand-500 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none ring-brand-500 focus:ring-2"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </section>
  );
}
