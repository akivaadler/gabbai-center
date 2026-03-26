import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { computeReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";

// GET /api/reminders — returns current reminder alerts
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const alerts = await computeReminders();
    return NextResponse.json(alerts);
  } catch (error) {
    console.error("[GET /api/reminders]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
