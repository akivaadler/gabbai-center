import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, memberIds } = await req.json();

    const family = await prisma.family.update({
      where: { id: params.id },
      data: {
        ...(name?.trim() ? { name: name.trim() } : {}),
        ...(memberIds !== undefined
          ? {
              members: {
                set: memberIds.map((id: string) => ({ id })),
              },
            }
          : {}),
      },
      include: {
        members: {
          select: { id: true, firstName: true, lastName: true, isActive: true },
          orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        },
      },
    });

    return NextResponse.json(family);
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
    // Unlink all members first
    await prisma.member.updateMany({
      where: { familyId: params.id },
      data: { familyId: null },
    });

    await prisma.family.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
