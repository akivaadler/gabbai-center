import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/announcements/[id]
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
    const { title, body: bodyText, publishDate, expiresDate, isPublic, shabbosScheduleId } = body;

    const announcement = await prisma.announcement.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(bodyText !== undefined ? { body: bodyText.trim() } : {}),
        ...(publishDate !== undefined ? { publishDate: new Date(publishDate) } : {}),
        ...(expiresDate !== undefined
          ? { expiresDate: expiresDate ? new Date(expiresDate) : null }
          : {}),
        ...(isPublic !== undefined ? { isPublic } : {}),
        ...(shabbosScheduleId !== undefined
          ? { shabbosScheduleId: shabbosScheduleId || null }
          : {}),
      },
      include: {
        shabbosSchedule: {
          select: { id: true, parsha: true, shabbosDate: true },
        },
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("[PUT /api/announcements/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/announcements/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.announcement.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/announcements/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
