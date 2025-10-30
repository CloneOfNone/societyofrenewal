import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export type WaitlistPath = "lottery" | "need";
export type WaitlistStatus = "pending" | "confirmed";

export interface WaitlistTable {
  id: Generated<number>;
  email: string;
  email_hash: string;
  path: WaitlistPath;
  reason: string | null;
  status: WaitlistStatus;
  token: string;
  created_at: Generated<Date>;
  confirmed_at: Date | null;
  ip: string | null;
  user_agent: string | null;
}

export interface Database {
  waitlist: WaitlistTable;
}

export type WaitlistRow = Selectable<WaitlistTable>;
export type NewWaitlistRow = Insertable<WaitlistTable>;
export type WaitlistUpdate = Updateable<WaitlistTable>;
