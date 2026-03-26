import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/leinings - create or upsert a leining assignment
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { shabbosScheduleId, aliyah, memberId, notes } = body;

    if (!shabbosScheduleId || !aliyah) {
      return NextResponse.json(
        { error: "shabbosScheduleId and aliyah are required" },
        { status: 400 }
      );
    }

    // Check if a leining for this aliyah already exists for this schedule
    const existing = await prisma.leining.findFirst({
      where: { shabbosScheduleId, aliyah },
    });

    let leining;
    if (existing) {
      leining = await prisma.leining.update({
        where: { id: existing.id },
        data: {
          memberId: memberId || null,
          notes: notes?.trim() || null,
        },
        include: { member: true },
      });
    } else {
      leining = await prisma.leining.create({
        data: {
          shabbosScheduleId,
          aliyah,
          memberId: memberId || null,
          notes: notes?.trim() || null,
        },
        include: { member: true },
      });
    }

    return NextResponse.json(leining, { status: 201 });
  } catch (error) {
    console.error("[POST /api/leinings]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
