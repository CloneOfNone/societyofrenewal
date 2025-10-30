import { sql } from "kysely";

import type { Database } from "@/db/schema";

import type { Kysely } from "kysely";

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("waitlist")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("email", "varchar(320)", (col) => col.notNull())
    .addColumn("email_hash", "char(64)", (col) => col.notNull().unique())
    .addColumn("path", "varchar(16)", (col) => col.notNull())
    .addColumn("reason", "text")
    .addColumn("status", "varchar(16)", (col) =>
      col.notNull().defaultTo("pending"),
    )
    .addColumn("token", "varchar(128)", (col) => col.notNull())
    .addColumn("ip", "varchar(64)")
    .addColumn("user_agent", "varchar(512)")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("confirmed_at", "timestamptz")
    .execute();

  await db.schema
    .createIndex("waitlist_email_hash_idx")
    .on("waitlist")
    .column("email_hash")
    .execute();

  await db.schema
    .createIndex("waitlist_token_idx")
    .on("waitlist")
    .column("token")
    .execute();

  await db.schema
    .createIndex("waitlist_status_idx")
    .on("waitlist")
    .column("status")
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("waitlist").ifExists().cascade().execute();
}
