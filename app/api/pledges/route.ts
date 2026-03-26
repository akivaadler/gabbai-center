import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");
  const activeOnly = searchParams.get("active") === "true";

  const pledges = await prisma.donationPledge.findMany({
    where: {
      ...(memberId ? { memberId } : {}),
      ...(activeOnly ? { isActive: true } : {}),
    },
    include: {
      member: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(pledges);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { memberId, amount, currency, frequency, occasion, startDate, endDate, notes } = await req.json();

    if (!memberId || !amount || !startDate) {
      return NextResponse.json({ error: "memberId, amount, and startDate are required" }, { status: 400 });
    }

    const pledge = await prisma.donationPledge.create({
      data: {
        memberId,
        amount: parseFloat(amount),
        currency: currency ?? "USD",
        frequency: frequency ?? "ANNUAL",
        occasion: occasion?.trim() || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        notes: notes?.trim() || null,
        isActive: true,
      },
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(pledge, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
