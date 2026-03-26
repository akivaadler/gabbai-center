import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/minyan/[id]
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
    const { name, dayOfWeek, time, isActive, seasonalOverride } = body;

    const minyanTime = await prisma.minyanTime.update({
      where: { id: params.id },
      data: {
        name: name?.trim(),
        dayOfWeek,
        time,
        isActive,
        seasonalOverride:
          seasonalOverride !== undefined
            ? seasonalOverride
              ? JSON.stringify(seasonalOverride)
              : null
            : undefined,
      },
    });

    return NextResponse.json(minyanTime);
  } catch (error) {
    console.error("[PUT /api/minyan/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/minyan/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.minyanTime.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/minyan/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
