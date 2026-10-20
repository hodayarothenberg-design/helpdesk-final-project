export interface AdminPublic {
  id: string;
  username: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  admin: AdminPublic;
}

export interface AuthState {
  token: string | null;
  username: string | null;
}
