import { NextResponse, type NextRequest } from "next/server";

import { getDb } from "@/lib/db";
import { sendWaitlistConfirmationEmail } from "@/lib/email";
import { rateLimitIp } from "@/lib/rate-limit";
import { createConfirmationToken, hashEmail } from "@/lib/tokens";
import { validateTurnstileToken } from "@/lib/turnstile";
import { getClientIp } from "@/lib/utils";
import { waitlistFormSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = getClientIp(forwarded);
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  const rateLimit = await rateLimitIp(ip, { limit: 5, windowSeconds: 60 });
  if (!rateLimit.allowed) {
    const now = Math.floor(Date.now() / 1000);
    const retryAfter = Math.max(rateLimit.reset - now, 0);
    return NextResponse.json(
      {
        message: "Too many attempts. Please wait a moment before retrying.",
        retryAfter,
      },
      {
        status: 429,
        headers: { "Retry-After": `${retryAfter}` },
      },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = waitlistFormSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Please review the highlighted fields.",
        issues: parsed.error.flatten(),
      },
      { status: 422 },
    );
  }

  const turnstile = await validateTurnstileToken(
    parsed.data.turnstileToken,
    ip,
  );

  if (!turnstile.success) {
    return NextResponse.json(
      {
        message: "Human verification failed.",
        reason: turnstile.message,
      },
      { status: 400 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const emailHash = hashEmail(email);
  const token = createConfirmationToken();
  const reason =
    parsed.data.path === "need" ? parsed.data.reason?.trim() || null : null;

  try {
    const db = await getDb();

    const existing = await db
      .selectFrom("waitlist")
      .select(["id", "status"])
      .where("email_hash", "=", emailHash)
      .executeTakeFirst();

    if (existing?.status === "confirmed") {
      return NextResponse.json(
        {
          message: "You are already confirmed for early access.",
          status: "confirmed",
        },
        { status: 409 },
      );
    }

    if (existing) {
      await db
        .updateTable("waitlist")
        .set({
          email,
          path: parsed.data.path,
          reason,
          status: "pending",
          token,
          confirmed_at: null,
          ip,
          user_agent: userAgent,
        })
        .where("email_hash", "=", emailHash)
        .executeTakeFirst();
    } else {
      await db
        .insertInto("waitlist")
        .values({
          email,
          email_hash: emailHash,
          path: parsed.data.path,
          reason,
          status: "pending",
          token,
          ip,
          user_agent: userAgent,
        })
        .execute();
    }

    await sendWaitlistConfirmationEmail({ email, token });

    return NextResponse.json(
      { status: "pending", message: "Check your email to confirm." },
      { status: 201 },
    );
  } catch (error) {
    console.error("[waitlist] failed to store entry", error);
    return NextResponse.json(
      { message: "Server error. Please try again shortly." },
      { status: 500 },
    );
  }
}
