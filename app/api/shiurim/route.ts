import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("active") === "true";

  const shiurim = await prisma.shiur.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }, { title: "asc" }],
  });

  return NextResponse.json(shiurim);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, titleHe, description, teacher, dayOfWeek, time, location, isActive, notes } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const shiur = await prisma.shiur.create({
      data: {
        title: title.trim(),
        titleHe: titleHe?.trim() || null,
        description: description?.trim() || null,
        teacher: teacher?.trim() || null,
        dayOfWeek: dayOfWeek || null,
        time: time || null,
        location: location?.trim() || null,
        isActive: isActive !== false,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(shiur, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
