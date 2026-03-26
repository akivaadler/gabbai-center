import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/donations - list all donations (GABBAI only)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");
  const taxYear = searchParams.get("taxYear");
  const method = searchParams.get("method");

  const donations = await prisma.donation.findMany({
    where: {
      ...(memberId ? { memberId } : {}),
      ...(taxYear ? { taxYear: parseInt(taxYear, 10) } : {}),
      ...(method ? { method } : {}),
    },
    include: {
      member: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(donations);
}

// POST /api/donations - create donation (GABBAI only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { memberId, amount, date, method, occasion, notes, receiptSent, taxYear } = body;

    if (!memberId || !amount || !date || !method) {
      return NextResponse.json(
        { error: "memberId, amount, date, and method are required" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);
    const computedTaxYear = taxYear ?? parsedDate.getFullYear();

    const donation = await prisma.donation.create({
      data: {
        memberId,
        amount: parseFloat(amount),
        date: parsedDate,
        method,
        occasion: occasion?.trim() || null,
        notes: notes?.trim() || null,
        receiptSent: receiptSent ?? false,
        taxYear: computedTaxYear,
      },
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(donation, { status: 201 });
  } catch (error) {
    console.error("[POST /api/donations]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
