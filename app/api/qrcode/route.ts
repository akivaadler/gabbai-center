import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateBitQR, generatePayboxQR, generateGenericQR } from "@/lib/qrcode";

// POST /api/qrcode - generate QR code
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, amount, description, phone, payboxUserId, url } = await req.json();

    let dataUrl: string;

    switch (type) {
      case "BIT": {
        const bitPhone = phone ?? process.env.BIT_PHONE_NUMBER ?? "";
        if (!bitPhone) {
          return NextResponse.json({ error: "BIT_PHONE_NUMBER not configured" }, { status: 400 });
        }
        dataUrl = await generateBitQR(amount ?? 0, description ?? "Donation", bitPhone);
        break;
      }
      case "PAYBOX": {
        const userId = payboxUserId ?? process.env.PAYBOX_USER_ID ?? "";
        if (!userId) {
          return NextResponse.json({ error: "PAYBOX_USER_ID not configured" }, { status: 400 });
        }
        dataUrl = await generatePayboxQR(userId, amount ?? 0, description ?? "Donation");
        break;
      }
      case "GENERIC": {
        if (!url) {
          return NextResponse.json({ error: "url is required" }, { status: 400 });
        }
        dataUrl = await generateGenericQR(url);
        break;
      }
      default:
        return NextResponse.json({ error: "Invalid type. Use BIT, PAYBOX, or GENERIC" }, { status: 400 });
    }

    return NextResponse.json({ dataUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
