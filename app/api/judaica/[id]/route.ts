import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const item = await prisma.judaicaItem.update({
    where: { id: params.id },
    data: {
      name: body.name,
      description: body.description ?? null,
      category: body.category ?? "OTHER",
      status: body.status ?? "AVAILABLE",
      borrowerName: body.borrowerName ?? null,
      borrowedDate: body.borrowedDate ? new Date(body.borrowedDate) : null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      repairShop: body.repairShop ?? null,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.judaicaItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
