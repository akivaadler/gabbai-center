import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/minyan
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const times = await prisma.minyanTime.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
  });

  return NextResponse.json(times);
}

// POST /api/minyan
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, dayOfWeek, time, isActive, seasonalOverride } = body;

    if (!name?.trim() || !dayOfWeek || !time) {
      return NextResponse.json(
        { error: "name, dayOfWeek, and time are required" },
        { status: 400 }
      );
    }

    const minyanTime = await prisma.minyanTime.create({
      data: {
        name: name.trim(),
        dayOfWeek,
        time,
        isActive: isActive ?? true,
        seasonalOverride: seasonalOverride
          ? JSON.stringify(seasonalOverride)
          : null,
      },
    });

    return NextResponse.json(minyanTime, { status: 201 });
  } catch (error) {
    console.error("[POST /api/minyan]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
