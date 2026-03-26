import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/schedule/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schedule = await prisma.shabbosSchedule.findUnique({
    where: { id: params.id },
    include: {
      leinings: {
        include: { member: true },
        orderBy: { aliyah: "asc" },
      },
      kibbudim: {
        include: { member: true },
        orderBy: { createdAt: "asc" },
      },
      announcements: {
        orderBy: { publishDate: "asc" },
      },
    },
  });

  if (!schedule) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(schedule);
}

// PUT /api/schedule/[id]
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
    const { parsha, notes } = body;

    const schedule = await prisma.shabbosSchedule.update({
      where: { id: params.id },
      data: {
        parsha: parsha?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("[PUT /api/schedule/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/schedule/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.shabbosSchedule.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/schedule/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
