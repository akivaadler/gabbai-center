import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/members/[id]/life-events
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.lifeEvent.findMany({
    where: { memberId: params.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(events);
}

// POST /api/members/[id]/life-events
export async function POST(
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

    if (!type || !hebrewDay || !hebrewMonth) {
      return NextResponse.json(
        { error: "type, hebrewDay, and hebrewMonth are required" },
        { status: 400 }
      );
    }

    const event = await prisma.lifeEvent.create({
      data: {
        memberId: params.id,
        type,
        label: label?.trim() || null,
        hebrewDay: Number(hebrewDay),
        hebrewMonth: Number(hebrewMonth),
        hebrewYear: hebrewYear ? Number(hebrewYear) : null,
        recurs: recurs ?? true,
        notifyGabbai: notifyGabbai ?? true,
        linkedMemberName: linkedMemberName?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("[POST /api/members/[id]/life-events]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
