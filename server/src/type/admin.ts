import type { ObjectId } from "mongodb";

export interface AdminDocument {
  _id: ObjectId;
  username: string;
  passwordHash: string;
}

export interface AdminLoginInput {
  username: string;
  password: string;
}

export interface AdminPublic {
  id: string;
  username: string;
}

export interface LoginResult {
  token: string;
  admin: AdminPublic;
}

export interface AuthPayload {
  adminId: string;
  username: string;
}
