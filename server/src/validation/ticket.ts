import type { CreateTicketInput, UpdateTicketInput } from "../type/ticket.js";
import {
  isNonEmptyString,
  isRecord,
  isTicketCategory,
  isTicketPriority,
  isTicketStatus,
  looksLikeEmail,
  looksLikePhone,
} from "./guards.js";

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function requiredText(
  value: unknown,
  field: string,
  minLength = 1
): ParseResult<string> {
  if (!isNonEmptyString(value)) {
    return { ok: false, error: `${field} is required` };
  }
  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    return {
      ok: false,
      error: `${field} must be at least ${minLength} characters`,
    };
  }
  return { ok: true, value: trimmed };
}

export function parseCreateTicketInput(body: unknown): ParseResult<CreateTicketInput> {
  if (!isRecord(body)) {
    return { ok: false, error: "Request body must be an object" };
  }

  const customerName = requiredText(body.customerName, "Full name", 2);
  if (!customerName.ok) {
    return customerName;
  }

  const email = requiredText(body.email, "Email");
  if (!email.ok) {
    return email;
  }
  if (!looksLikeEmail(email.value)) {
    return { ok: false, error: "Please enter a valid email address" };
  }

  const phone = requiredText(body.phone, "Phone");
  if (!phone.ok) {
    return phone;
  }
  if (!looksLikePhone(phone.value)) {
    return { ok: false, error: "Please enter a valid phone number" };
  }

  const title = requiredText(body.title, "Title", 3);
  if (!title.ok) {
    return title;
  }

  const description = requiredText(body.description, "Description", 10);
  if (!description.ok) {
    return description;
  }

  if (!isTicketCategory(body.category)) {
    return { ok: false, error: "Category must be one of the allowed values" };
  }

  if (!isTicketPriority(body.priority)) {
    return { ok: false, error: "Priority must be Low, Medium or High" };
  }

  return {
    ok: true,
    value: {
      customerName: customerName.value,
      email: email.value.toLowerCase(),
      phone: phone.value,
      title: title.value,
      description: description.value,
      category: body.category,
      priority: body.priority,
    },
  };
}

export function parseUpdateTicketInput(body: unknown): ParseResult<UpdateTicketInput> {
  if (!isRecord(body)) {
    return { ok: false, error: "Request body must be an object" };
  }

  const hasStatus = Object.prototype.hasOwnProperty.call(body, "status");
  const hasPriority = Object.prototype.hasOwnProperty.call(body, "priority");

  if (!hasStatus && !hasPriority) {
    return {
      ok: false,
      error: "At least one of status or priority must be provided",
    };
  }

  const update: UpdateTicketInput = {};

  if (hasStatus) {
    if (!isTicketStatus(body.status)) {
      return { ok: false, error: "Status must be Open, In Progress or Resolved" };
    }
    update.status = body.status;
  }

  if (hasPriority) {
    if (!isTicketPriority(body.priority)) {
      return { ok: false, error: "Priority must be Low, Medium or High" };
    }
    update.priority = body.priority;
  }

  return { ok: true, value: update };
}

export function parseLoginInput(
  body: unknown
): ParseResult<{ username: string; password: string }> {
  if (!isRecord(body)) {
    return { ok: false, error: "Request body must be an object" };
  }

  if (!isNonEmptyString(body.username) || !isNonEmptyString(body.password)) {
    return { ok: false, error: "Username and password are required" };
  }

  return {
    ok: true,
    value: {
      username: body.username.trim(),
      password: body.password,
    },
  };
}
