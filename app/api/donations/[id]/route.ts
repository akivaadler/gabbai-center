import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/donations/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const donation = await prisma.donation.findUnique({
    where: { id: params.id },
    include: {
      member: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!donation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(donation);
}

// PUT /api/donations/[id]
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
    const { memberId, amount, date, method, occasion, notes, receiptSent, taxYear } = body;

    const parsedDate = date ? new Date(date) : undefined;
    const computedTaxYear = taxYear ?? (parsedDate ? parsedDate.getFullYear() : undefined);

    const donation = await prisma.donation.update({
      where: { id: params.id },
      data: {
        ...(memberId !== undefined ? { memberId } : {}),
        ...(amount !== undefined ? { amount: parseFloat(amount) } : {}),
        ...(parsedDate !== undefined ? { date: parsedDate } : {}),
        ...(method !== undefined ? { method } : {}),
        ...(occasion !== undefined ? { occasion: occasion?.trim() || null } : {}),
        ...(notes !== undefined ? { notes: notes?.trim() || null } : {}),
        ...(receiptSent !== undefined ? { receiptSent } : {}),
        ...(computedTaxYear !== undefined ? { taxYear: computedTaxYear } : {}),
      },
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(donation);
  } catch (error) {
    console.error("[PUT /api/donations/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/donations/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.donation.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/donations/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
