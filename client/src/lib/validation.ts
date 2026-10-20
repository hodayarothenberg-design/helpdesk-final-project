import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  type CreateTicketInput,
  type TicketFormErrors,
  type TicketFormState,
} from "../types/ticket";

export const EMPTY_TICKET_FORM: TicketFormState = {
  customerName: "",
  email: "",
  phone: "",
  title: "",
  description: "",
  category: "",
  priority: "",
};

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

export function validateTicketForm(form: TicketFormState): TicketFormErrors {
  const errors: TicketFormErrors = {};

  if (isBlank(form.customerName)) {
    errors.customerName = "Full name is required";
  }

  if (isBlank(form.email)) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  const phoneDigits = form.phone.replace(/\D/g, "");
  if (isBlank(form.phone)) {
    errors.phone = "Phone is required";
  } else if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    errors.phone = "Please enter a valid phone number";
  }

  if (isBlank(form.title)) {
    errors.title = "Title is required";
  } else if (form.title.trim().length < 3) {
    errors.title = "Title must be more than a single character";
  }

  if (!form.category || !TICKET_CATEGORIES.includes(form.category)) {
    errors.category = "Please select a valid category";
  }

  if (!form.priority || !TICKET_PRIORITIES.includes(form.priority)) {
    errors.priority = "Please select a valid priority";
  }

  if (isBlank(form.description)) {
    errors.description = "Description is required";
  } else if (form.description.trim().length < 10) {
    errors.description = "Please describe the problem in more detail";
  }

  return errors;
}

export function toCreateTicketInput(form: TicketFormState): CreateTicketInput | null {
  if (!form.category || !form.priority) {
    return null;
  }

  return {
    customerName: form.customerName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    priority: form.priority,
  };
}
