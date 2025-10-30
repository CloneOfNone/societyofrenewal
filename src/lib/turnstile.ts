import { env } from "@/lib/env";

export interface TurnstileValidationResult {
  success: boolean;
  message?: string;
  skipped?: boolean;
}

export async function validateTurnstileToken(
  token: string | null | undefined,
  remoteIp: string,
): Promise<TurnstileValidationResult> {
  if (!env.TURNSTILE_SECRET) {
    return { success: true, skipped: true };
  }

  if (!token) {
    return { success: false, message: "missing_token" };
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET,
          response: token,
          remoteip: remoteIp,
        }),
      },
    );

    if (!response.ok) {
      return { success: false, message: "turnstile_unreachable" };
    }

    const payload = (await response.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!payload.success) {
      return {
        success: false,
        message: payload["error-codes"]?.[0] ?? "turnstile_failed",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[turnstile] validation error", error);
    return { success: false, message: "turnstile_error" };
  }
}
