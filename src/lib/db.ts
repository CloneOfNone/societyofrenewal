import type { Database } from "@/db/schema";

import type { Kysely } from "kysely";

declare global {
  var __db: Kysely<Database> | undefined;
}

function ensureConnectionString() {
  if (!process.env.POSTGRES_URL) {
    const fallback =
      process.env.DATABASE_URL ??
      (process.env.NODE_ENV === "production"
        ? undefined
        : "postgres://user:password@127.0.0.1:5432/societyofrenewal");

    if (fallback) {
      process.env.POSTGRES_URL = fallback;
    }
  }

  if (!process.env.POSTGRES_URL) {
    throw new Error(
      "POSTGRES_URL is not configured. Set DATABASE_URL or POSTGRES_URL before using the database.",
    );
  }
}

let database: Kysely<Database> | undefined = global.__db;
let databasePromise: Promise<Kysely<Database>> | undefined;

async function initDb(): Promise<Kysely<Database>> {
  ensureConnectionString();
  const { createKysely } = await import("@vercel/postgres-kysely");
  const instance = createKysely<Database>();

  if (process.env.NODE_ENV !== "production") {
    global.__db = instance;
  }

  database = instance;
  return instance;
}

export async function getDb(): Promise<Kysely<Database>> {
  if (database) return database;
  if (!databasePromise) {
    databasePromise = initDb();
  }

  return databasePromise;
}
