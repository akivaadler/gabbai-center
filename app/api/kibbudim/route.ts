import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendAliyahThankYouEmail } from "@/lib/email";

// GET /api/kibbudim
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const kibbudim = await prisma.kibbud.findMany({
    where: {
      memberId: memberId ?? undefined,
      type: type ?? undefined,
      date: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
    },
    orderBy: { date: "desc" },
    include: {
      member: true,
      shabbosSchedule: true,
    },
  });

  return NextResponse.json(kibbudim);
}

// POST /api/kibbudim
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const shouldSendEmail = searchParams.get("sendEmail") === "true";

    const body = await req.json();
    const {
      memberId,
      type,
      aliyahNumber,
      occasion,
      date,
      shabbosScheduleId,
      notes,
    } = body;

    if (!memberId || !type || !date) {
      return NextResponse.json(
        { error: "memberId, type, and date are required" },
        { status: 400 }
      );
    }

    const kibbud = await prisma.kibbud.create({
      data: {
        memberId,
        type,
        aliyahNumber: aliyahNumber?.trim() || null,
        occasion: occasion?.trim() || null,
        date: new Date(date),
        shabbosScheduleId: shabbosScheduleId || null,
        notes: notes?.trim() || null,
      },
      include: { member: true, shabbosSchedule: true },
    });

    // Send aliyah thank-you email if requested and member has email
    if (shouldSendEmail && type === "ALIYAH" && kibbud.member?.email) {
      const shulNameSetting = await prisma.setting.findUnique({ where: { key: "shulName" } });
      const shulName = shulNameSetting?.value || "Your Synagogue";
      const portalUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

      const shabbosDate = kibbud.shabbosSchedule?.shabbosDate
        ? new Date(kibbud.shabbosSchedule.shabbosDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : new Date(kibbud.date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          });

      try {
        await sendAliyahThankYouEmail({
          memberName: `${kibbud.member.firstName} ${kibbud.member.lastName}`,
          memberEmail: kibbud.member.email,
          shulName,
          shabbosDate,
          parsha: kibbud.shabbosSchedule?.parsha || null,
          portalUrl,
        });
      } catch (emailErr) {
        console.error("[POST /api/kibbudim] Failed to send aliyah email:", emailErr);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(kibbud, { status: 201 });
  } catch (error) {
    console.error("[POST /api/kibbudim]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
