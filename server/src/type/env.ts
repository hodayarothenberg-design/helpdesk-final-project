export interface ServerEnv {
  port: number;
  mongoUri: string;
  dbName: string;
  jwtSecret: string;
  adminUsername: string;
  adminPassword: string;
  clientOrigin: string;
}

function readRequired(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadEnv(): ServerEnv {
  const portRaw = process.env.PORT ?? "3000";
  const port = Number(portRaw);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return {
    port,
    mongoUri: readRequired("MONGODB_URI"),
    dbName: process.env.MONGODB_DB_NAME?.trim() || "helpdesk",
    jwtSecret: readRequired("JWT_SECRET"),
    adminUsername: process.env.ADMIN_USERNAME?.trim() || "admin",
    adminPassword: readRequired("ADMIN_PASSWORD"),
    clientOrigin: process.env.CLIENT_ORIGIN?.trim() || "http://localhost:5173",
  };
}
