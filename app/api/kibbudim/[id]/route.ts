import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/kibbudim/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { memberId, type, aliyahNumber, occasion, date, shabbosScheduleId, notes } = body;

    const kibbud = await prisma.kibbud.update({
      where: { id: params.id },
      data: {
        memberId,
        type,
        aliyahNumber: aliyahNumber?.trim() || null,
        occasion: occasion?.trim() || null,
        date: date ? new Date(date) : undefined,
        shabbosScheduleId: shabbosScheduleId || null,
        notes: notes?.trim() || null,
      },
      include: { member: true, shabbosSchedule: true },
    });

    return NextResponse.json(kibbud);
  } catch (error) {
    console.error("[PUT /api/kibbudim/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/kibbudim/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.kibbud.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/kibbudim/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
