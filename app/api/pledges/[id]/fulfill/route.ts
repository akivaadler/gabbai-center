import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/pledges/[id]/fulfill - creates a Donation record from a pledge
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pledge = await prisma.donationPledge.findUnique({
      where: { id: params.id },
    });

    if (!pledge) {
      return NextResponse.json({ error: "Pledge not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const date = body.date ? new Date(body.date) : new Date();
    const method = body.method ?? "OTHER";

    const donation = await prisma.donation.create({
      data: {
        memberId: pledge.memberId,
        amount: pledge.amount,
        currency: pledge.currency,
        date,
        method,
        occasion: pledge.occasion ?? "Pledge Fulfillment",
        notes: `Fulfilled from pledge #${pledge.id}`,
        taxYear: date.getFullYear(),
        receiptSent: false,
      },
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ ok: true, donation });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
