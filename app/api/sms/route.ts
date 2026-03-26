import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendCustomSMS, sendLeinerAssignmentSMS, sendYahrtzeitReminderSMS } from "@/lib/sms";

// POST /api/sms
// Gabbai-only: send an SMS to one or more members
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "GABBAI") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { type, ...params } = body;

  try {
    switch (type) {
      case "CUSTOM": {
        const { memberIds, message } = params as { memberIds: string[]; message: string };
        if (!memberIds?.length || !message) {
          return Response.json({ error: "memberIds and message required" }, { status: 400 });
        }
        const members = await prisma.member.findMany({
          where: { id: { in: memberIds }, isActive: true },
          select: { id: true, phone: true, firstName: true, lastName: true },
        });
        const results = await Promise.allSettled(
          members
            .filter((m) => m.phone)
            .map((m) => sendCustomSMS({ memberPhone: m.phone!, message }))
        );
        const sent   = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected").length;
        return Response.json({ sent, failed });
      }

      case "LEINER_ASSIGNMENT": {
        const { memberId, shabbosDate, parsha, aliyah, lang } = params as {
          memberId: string;
          shabbosDate: string;
          parsha: string | null;
          aliyah: string;
          lang?: "en" | "he";
        };
        const member = await prisma.member.findUnique({
          where: { id: memberId },
          select: { firstName: true, lastName: true, phone: true },
        });
        if (!member?.phone) {
          return Response.json({ error: "Member has no phone number" }, { status: 400 });
        }
        const shulName = (await prisma.setting.findUnique({ where: { key: "shulName" } }))?.value ?? "The Shul";
        await sendLeinerAssignmentSMS({
          memberName: `${member.firstName} ${member.lastName}`,
          memberPhone: member.phone,
          shabbosDate,
          parsha,
          aliyah,
          shulName,
          lang: lang ?? "en",
        });
        return Response.json({ sent: 1 });
      }

      case "YAHRTZEIT_REMINDER": {
        const { memberId, deceasedName, daysAway, lang } = params as {
          memberId: string;
          deceasedName: string;
          daysAway: number;
          lang?: "en" | "he";
        };
        const member = await prisma.member.findUnique({
          where: { id: memberId },
          select: { firstName: true, lastName: true, phone: true },
        });
        if (!member?.phone) {
          return Response.json({ error: "Member has no phone number" }, { status: 400 });
        }
        const shulName = (await prisma.setting.findUnique({ where: { key: "shulName" } }))?.value ?? "The Shul";
        await sendYahrtzeitReminderSMS({
          memberName: `${member.firstName} ${member.lastName}`,
          memberPhone: member.phone,
          deceasedName,
          daysAway,
          shulName,
          lang: lang ?? "en",
        });
        return Response.json({ sent: 1 });
      }

      default:
        return Response.json({ error: `Unknown SMS type: ${type}` }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[SMS API]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
