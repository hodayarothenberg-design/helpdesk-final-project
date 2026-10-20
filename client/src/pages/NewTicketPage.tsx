import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { SelectField } from "../components/SelectField";
import { ErrorMessage } from "../components/ErrorMessage";
import { EMPTY_TICKET_FORM, toCreateTicketInput, validateTicketForm } from "../lib/validation";
import { createTicket } from "../services/ticketService";
import { ApiRequestError } from "../types/api";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  type TicketFormErrors,
  type TicketFormState,
} from "../types/ticket";

export function NewTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<TicketFormState>(EMPTY_TICKET_FORM);
  const [errors, setErrors] = useState<TicketFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof TicketFormState, value: string): void => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const field = event.target.name as keyof TicketFormState;
    updateField(field, event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const nextErrors = validateTicketForm(form);
    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload = toCreateTicketInput(form);
    if (!payload) {
      return;
    }

    setSubmitting(true);
    try {
      const created = await createTicket(payload);
      navigate("/confirmation", { state: { ticketId: created.id } });
    } catch (caught: unknown) {
      const message =
        caught instanceof ApiRequestError
          ? caught.message
          : "Unable to submit the ticket";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-brand-600">Public support form</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Open a service ticket</h1>
        <p className="mt-2 text-slate-600">
          Describe the problem and our team will take it from there. No account is required.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        noValidate
      >
        {submitError ? <ErrorMessage message={submitError} /> : null}

        <Field
          label="Full name"
          name="customerName"
          value={form.customerName}
          error={errors.customerName}
          onChange={handleInputChange}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={handleInputChange}
          />
          <Field
            label="Phone"
            name="phone"
            value={form.phone}
            error={errors.phone}
            onChange={handleInputChange}
          />
        </div>
        <Field
          label="Title"
          name="title"
          value={form.title}
          error={errors.title}
          onChange={handleInputChange}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="category"
            label="Category"
            value={form.category}
            placeholder="Select category"
            error={errors.category}
            options={TICKET_CATEGORIES.map((item) => ({ value: item, label: item }))}
            onChange={(value) => updateField("category", value)}
          />
          <SelectField
            id="priority"
            label="Priority"
            value={form.priority}
            placeholder="Select priority"
            error={errors.priority}
            options={TICKET_PRIORITIES.map((item) => ({ value: item, label: item }))}
            onChange={(value) => updateField("priority", value)}
          />
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            name="description"
            rows={5}
            value={form.description}
            onChange={handleInputChange}
            className={`rounded-lg border px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 ${
              errors.description ? "border-red-400" : "border-slate-300"
            }`}
          />
          {errors.description ? (
            <span className="text-xs text-red-600">{errors.description}</span>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit ticket"}
        </button>
      </form>
    </section>
  );
}

interface FieldProps {
  label: string;
  name: keyof TicketFormState;
  value: string;
  error?: string;
  type?: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

function Field({ label, name, value, error, type = "text", onChange }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`h-11 rounded-lg border px-3 text-sm outline-none ring-brand-500 focus:ring-2 ${
          error ? "border-red-400" : "border-slate-300"
        }`}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
