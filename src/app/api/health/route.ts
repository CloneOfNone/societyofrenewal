import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    await db.selectFrom("waitlist").select("id").limit(1).execute();
    return NextResponse.json({
      status: "ok",
      services: {
        database: "reachable",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[health] database unreachable", error);
    return NextResponse.json(
      {
        status: "degraded",
        services: {
          database: "unreachable",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
