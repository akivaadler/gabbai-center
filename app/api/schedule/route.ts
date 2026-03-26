import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getParshaForShabbos, toHebrewDate } from "@/lib/hebrew";

// GET /api/schedule
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schedules = await prisma.shabbosSchedule.findMany({
    orderBy: { shabbosDate: "desc" },
    include: {
      leinings: { include: { member: true } },
      kibbudim: { include: { member: true } },
      _count: { select: { kibbudim: true, leinings: true } },
    },
  });

  return NextResponse.json(schedules);
}

// POST /api/schedule
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { shabbosDate, notes } = body;

    if (!shabbosDate) {
      return NextResponse.json({ error: "shabbosDate is required" }, { status: 400 });
    }

    const date = new Date(shabbosDate);
    // Validate it's a Saturday
    if (date.getDay() !== 6) {
      return NextResponse.json({ error: "Shabbos date must be a Saturday" }, { status: 400 });
    }

    const parsha = getParshaForShabbos(date);
    const hdate = toHebrewDate(date);

    const schedule = await prisma.shabbosSchedule.create({
      data: {
        shabbosDate: date,
        parsha: parsha ?? null,
        hebrewDay: hdate.getDate(),
        hebrewMonth: hdate.getMonth(),
        hebrewYear: hdate.getFullYear(),
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("[POST /api/schedule]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
