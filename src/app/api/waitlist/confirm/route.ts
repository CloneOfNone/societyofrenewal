import { NextResponse, type NextRequest } from "next/server";

import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { message: "Missing confirmation token." },
      { status: 400 },
    );
  }

  try {
    const db = await getDb();

    const existing = await db
      .selectFrom("waitlist")
      .select(["id", "status"])
      .where("token", "=", token)
      .executeTakeFirst();

    if (!existing) {
      return NextResponse.json(
        { message: "Token expired or not found." },
        { status: 404 },
      );
    }

    if (existing.status === "confirmed") {
      return NextResponse.json(
        { status: "already_confirmed" },
        { status: 200 },
      );
    }

    await db
      .updateTable("waitlist")
      .set({
        status: "confirmed",
        confirmed_at: new Date(),
      })
      .where("id", "=", existing.id)
      .executeTakeFirst();

    return NextResponse.json({ status: "confirmed" });
  } catch (error) {
    console.error("[waitlist-confirm] error", error);
    return NextResponse.json(
      { message: "Unable to confirm at this time." },
      { status: 500 },
    );
  }
}
