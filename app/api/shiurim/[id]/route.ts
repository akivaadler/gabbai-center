import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shiur = await prisma.shiur.findUnique({ where: { id: params.id } });
  if (!shiur) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(shiur);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, titleHe, description, teacher, dayOfWeek, time, location, isActive, notes } = body;

    const shiur = await prisma.shiur.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        titleHe: titleHe?.trim() || null,
        description: description?.trim() || null,
        teacher: teacher?.trim() || null,
        dayOfWeek: dayOfWeek || null,
        time: time || null,
        location: location?.trim() || null,
        ...(isActive !== undefined ? { isActive } : {}),
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(shiur);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.shiur.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
