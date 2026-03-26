import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatHebrewDate, toHebrewDate } from "@/lib/hebrew";
import { MemberScheduleClient } from "@/components/portal/MemberScheduleClient";

export const dynamic = "force-dynamic";

export default async function MemberSchedulePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const now = new Date();

  const [schedules, shabbosMinyanTimes] = await Promise.all([
    prisma.shabbosSchedule.findMany({
      where: { shabbosDate: { gte: now } },
      orderBy: { shabbosDate: "asc" },
      take: 10,
      include: {
        announcements: {
          where: {
            isPublic: true,
            publishDate: { lte: now },
            OR: [{ expiresDate: null }, { expiresDate: { gt: now } }],
          },
        },
        leinings: {
          include: {
            member: { select: { firstName: true, lastName: true } },
          },
          orderBy: { aliyah: "asc" },
        },
      },
    }),
    prisma.minyanTime.findMany({
      where: { dayOfWeek: "SHABBOS", isActive: true },
      orderBy: { time: "asc" },
    }),
  ]);

  const serializedSchedules = schedules.map((s) => ({
    id: s.id,
    parsha: s.parsha,
    hebrewDate: formatHebrewDate(toHebrewDate(s.shabbosDate)),
    gregDate: new Date(s.shabbosDate).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    notes: s.notes,
    leinings: s.leinings.map((l) => ({
      id: l.id,
      aliyah: l.aliyah,
      memberName: l.member ? `${l.member.firstName} ${l.member.lastName}` : null,
    })),
    announcements: s.announcements.map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      isPublic: a.isPublic,
    })),
  }));

  return (
    <MemberScheduleClient
      schedules={serializedSchedules}
      shabbosMinyanTimes={shabbosMinyanTimes}
    />
  );
}
