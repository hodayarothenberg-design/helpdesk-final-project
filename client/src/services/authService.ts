import type { LoginInput, LoginResult } from "../types/auth";
import { apiRequest } from "./apiClient";

export async function loginAdmin(input: LoginInput): Promise<LoginResult> {
  return apiRequest<LoginResult>("/admin/login", {
    method: "POST",
    body: input,
  });
}
