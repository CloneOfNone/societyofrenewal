import { promises as fs } from "node:fs";
import path from "node:path";

import { FileMigrationProvider, Migrator } from "kysely";

import { getDb } from "@/lib/db";

async function migrateToLatest() {
  const migrationFolder = path.join(process.cwd(), "src/db/migrations");

  const database = await getDb();

  const migrator = new Migrator({
    db: database,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder,
    }),
  });

  try {
    const { error, results } = await migrator.migrateToLatest();

    results?.forEach((result) => {
      if (result.status === "Success") {
        console.log(`[migrate] ${result.migrationName} ✅`);
      } else if (result.status === "Error") {
        console.error(`[migrate] ${result.migrationName} ❌`);
      }
    });

    if (error) {
      console.error("[migrate] failed", error);
      process.exitCode = 1;
    } else {
      console.log("[migrate] completed");
    }
  } catch (error) {
    console.error("[migrate] unexpected failure", error);
    process.exitCode = 1;
  } finally {
    await database.destroy?.();
  }
}

void migrateToLatest();
