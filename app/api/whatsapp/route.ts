import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendWhatsApp, sendShabbosSheetWhatsApp } from "@/lib/whatsapp";
import { prisma } from "@/lib/prisma";

// POST /api/whatsapp - send WhatsApp message (GABBAI only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.TWILIO_WHATSAPP_ENABLED !== "true") {
    return NextResponse.json({ error: "WhatsApp integration is not enabled." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { type, phone, message, shabbosScheduleId } = body;

    if (type === "CUSTOM") {
      if (!phone || !message) {
        return NextResponse.json({ error: "phone and message required" }, { status: 400 });
      }
      await sendWhatsApp(phone, message);
      return NextResponse.json({ ok: true });
    }

    if (type === "SHABBOS_SHEET") {
      if (!phone) {
        return NextResponse.json({ error: "phone required" }, { status: 400 });
      }

      // Get shabbos data
      const shulName = (await prisma.setting.findUnique({ where: { key: "SHUL_NAME" } }))?.value ?? "Shul";
      const schedule = shabbosScheduleId
        ? await prisma.shabbosSchedule.findUnique({
            where: { id: shabbosScheduleId },
            include: {
              announcements: { where: { isPublic: true } },
            },
          })
        : null;

      const minyanTimes = await prisma.minyanTime.findMany({
        where: { isActive: true, dayOfWeek: "SHABBOS" },
        orderBy: { time: "asc" },
      });

      const parsha = schedule?.parsha ?? "This Week";
      const shabbosDate = schedule
        ? new Date(schedule.shabbosDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "";

      await sendShabbosSheetWhatsApp({
        phone,
        parsha,
        shabbosDate,
        minyanTimes: minyanTimes.map((mt) => ({ name: mt.name, time: mt.time })),
        announcements: (schedule?.announcements ?? []).map((a) => ({ title: a.title, body: a.body })),
        shulName,
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
