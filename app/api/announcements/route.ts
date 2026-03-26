import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/announcements - list all announcements (GABBAI only)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const isPublic = searchParams.get("isPublic");
  const shabbosScheduleId = searchParams.get("shabbosScheduleId");

  const announcements = await prisma.announcement.findMany({
    where: {
      ...(isPublic !== null ? { isPublic: isPublic === "true" } : {}),
      ...(shabbosScheduleId ? { shabbosScheduleId } : {}),
    },
    include: {
      shabbosSchedule: {
        select: { id: true, parsha: true, shabbosDate: true },
      },
    },
    orderBy: { publishDate: "desc" },
  });

  return NextResponse.json(announcements);
}

// POST /api/announcements - create announcement (GABBAI only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, body: bodyText, publishDate, expiresDate, isPublic, shabbosScheduleId } = body;

    if (!title?.trim() || !bodyText?.trim() || !publishDate) {
      return NextResponse.json(
        { error: "title, body, and publishDate are required" },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        body: bodyText.trim(),
        publishDate: new Date(publishDate),
        expiresDate: expiresDate ? new Date(expiresDate) : null,
        isPublic: isPublic ?? true,
        shabbosScheduleId: shabbosScheduleId || null,
      },
      include: {
        shabbosSchedule: {
          select: { id: true, parsha: true, shabbosDate: true },
        },
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("[POST /api/announcements]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
