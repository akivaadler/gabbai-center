import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/life-events/[id]
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
    const {
      type,
      label,
      hebrewDay,
      hebrewMonth,
      hebrewYear,
      recurs,
      notifyGabbai,
      linkedMemberName,
      notes,
    } = body;

    const event = await prisma.lifeEvent.update({
      where: { id: params.id },
      data: {
        type,
        label: label?.trim() || null,
        hebrewDay: hebrewDay !== undefined ? Number(hebrewDay) : undefined,
        hebrewMonth: hebrewMonth !== undefined ? Number(hebrewMonth) : undefined,
        hebrewYear: hebrewYear !== undefined ? (hebrewYear ? Number(hebrewYear) : null) : undefined,
        recurs,
        notifyGabbai,
        linkedMemberName: linkedMemberName?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("[PUT /api/life-events/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/life-events/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.lifeEvent.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/life-events/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
