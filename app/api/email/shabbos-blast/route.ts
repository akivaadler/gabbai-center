import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildShabbosEmailHtml } from "@/lib/shabbosEmail";
import nodemailer from "nodemailer";

// POST /api/email/shabbos-blast - send Shabbos email to all active members (GABBAI only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { shabbosScheduleId } = body;

    // Get settings
    const settingsRaw = await prisma.setting.findMany();
    const settings: Record<string, string> = {};
    for (const s of settingsRaw) {
      settings[s.key] = s.value;
    }

    const shulName = settings["SHUL_NAME"] ?? "Shul";
    const shulAddress = settings["SHUL_ADDRESS"] ?? "";
    const smtpHost = settings["SMTP_HOST"];
    const smtpPort = parseInt(settings["SMTP_PORT"] ?? "587");
    const smtpUser = settings["SMTP_USER"];
    const smtpPass = settings["SMTP_PASS"];
    const smtpFrom = settings["SMTP_FROM"] ?? smtpUser ?? "noreply@shul.local";

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json({ error: "SMTP not configured. Please update settings." }, { status: 400 });
    }

    // Get schedule data
    const schedule = shabbosScheduleId
      ? await prisma.shabbosSchedule.findUnique({
          where: { id: shabbosScheduleId },
          include: {
            announcements: { where: { isPublic: true } },
          },
        })
      : null;

    // Get upcoming Shabbos if no specific schedule
    const upcomingSchedule = schedule ?? (await prisma.shabbosSchedule.findFirst({
      where: { shabbosDate: { gte: new Date() } },
      orderBy: { shabbosDate: "asc" },
      include: { announcements: { where: { isPublic: true } } },
    }));

    const minyanTimes = await prisma.minyanTime.findMany({
      where: { isActive: true, dayOfWeek: "SHABBOS" },
      orderBy: { time: "asc" },
    });

    const parsha = upcomingSchedule?.parsha ?? "This Shabbos";
    const shabbosDateStr = upcomingSchedule
      ? new Date(upcomingSchedule.shabbosDate).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    const shabbosHebrew = upcomingSchedule
      ? `${upcomingSchedule.hebrewDay} ${upcomingSchedule.hebrewMonth}`
      : "";

    const html = buildShabbosEmailHtml({
      parsha,
      shabbosDate: shabbosDateStr,
      shabbosHebrew,
      minyanTimes: minyanTimes.map((mt) => ({ name: mt.name, time: mt.time })),
      announcements: (upcomingSchedule?.announcements ?? []).map((a) => ({ title: a.title, body: a.body })),
      shulName,
      shulAddress,
    });

    // Get members with email
    const members = await prisma.member.findMany({
      where: { isActive: true, email: { not: null } },
      select: { email: true, firstName: true, lastName: true },
    });

    const recipients = members.filter((m) => m.email);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    let sent = 0;
    let failed = 0;

    for (const member of recipients) {
      try {
        await transporter.sendMail({
          from: `"${shulName}" <${smtpFrom}>`,
          to: member.email!,
          subject: `Shabbos Sheet — Parshas ${parsha}`,
          html,
        });
        sent++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({ ok: true, sent, failed, total: recipients.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
