import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateDonationReceipt } from "@/lib/pdf";

// GET /api/donations/[id]/receipt - generate and download PDF receipt
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const donation = await prisma.donation.findUnique({
      where: { id: params.id },
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // Fetch shul settings from Setting table, falling back to env vars
    const [nameRow, addressRow, einRow] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "shulName" } }),
      prisma.setting.findUnique({ where: { key: "shulAddress" } }),
      prisma.setting.findUnique({ where: { key: "shulEin" } }),
    ]);

    const shulSettings = {
      shulName:
        nameRow?.value ?? process.env.SHUL_NAME ?? "Beth Israel Congregation",
      shulAddress:
        addressRow?.value ??
        process.env.SHUL_ADDRESS ??
        "123 Main Street, Anytown, NY 10001",
      shulEin: einRow?.value ?? process.env.SHUL_EIN ?? "XX-XXXXXXX",
    };

    const pdfBytes = await generateDonationReceipt(
      {
        id: donation.id,
        amount: donation.amount,
        date: donation.date,
        method: donation.method,
        occasion: donation.occasion,
        notes: donation.notes,
        taxYear: donation.taxYear,
      },
      donation.member,
      shulSettings
    );

    // Mark receipt as sent
    await prisma.donation.update({
      where: { id: params.id },
      data: { receiptSent: true },
    });

    const buffer = Buffer.from(pdfBytes);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${params.id.substring(0, 8)}.pdf"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[GET /api/donations/[id]/receipt]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
