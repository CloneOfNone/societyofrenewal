import crypto from "node:crypto";

export function hashEmail(email: string): string {
  return crypto
    .createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");
}

export function createConfirmationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
