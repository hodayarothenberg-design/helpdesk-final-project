import "dotenv/config";
import { ensureDefaultAdmin } from "./db/adminActions.js";
import { closeDB, connectDB } from "./db/connection.js";
import { createApp } from "./server/app.js";
import { loadEnv } from "./type/env.js";

async function main(): Promise<void> {
  const env = loadEnv();

  try {
    await connectDB(env.mongoUri, env.dbName);
    await ensureDefaultAdmin(env.adminUsername, env.adminPassword);
    console.log(`Connected to MongoDB database "${env.dbName}"`);
  } catch (error) {
    console.error("Failed to connect to MongoDB");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const app = createApp({
    clientOrigin: env.clientOrigin,
    jwtSecret: env.jwtSecret,
  });

  const server = app.listen(env.port, () => {
    console.log(`Help Desk API listening on http://localhost:${env.port}`);
  });

  const shutdown = async (): Promise<void> => {
    server.close();
    await closeDB();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown();
  });
  process.on("SIGTERM", () => {
    void shutdown();
  });
}

void main();
