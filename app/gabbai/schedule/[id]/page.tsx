import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatHebrewDate, toHebrewDate } from "@/lib/hebrew";
import { ScheduleDetailClient } from "@/components/schedule/ScheduleDetailClient";

export const dynamic = "force-dynamic";

interface ScheduleDetailPageProps {
  params: { id: string };
}

export default async function ScheduleDetailPage({ params }: ScheduleDetailPageProps) {
  const [schedule, members] = await Promise.all([
    prisma.shabbosSchedule.findUnique({
      where: { id: params.id },
      include: {
        leinings: {
          include: { member: true },
          orderBy: { aliyah: "asc" },
        },
        kibbudim: {
          include: { member: true },
          orderBy: { createdAt: "asc" },
        },
        announcements: {
          orderBy: { publishDate: "asc" },
        },
      },
    }),
    prisma.member.findMany({
      where: { isActive: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  if (!schedule) notFound();

  const hdate = toHebrewDate(new Date(schedule.shabbosDate));
  const hebrewDateStr = formatHebrewDate(hdate);
  const gregDate = new Date(schedule.shabbosDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <ScheduleDetailClient
      scheduleId={schedule.id}
      parsha={schedule.parsha}
      hebrewDateStr={hebrewDateStr}
      gregDate={gregDate}
      notes={schedule.notes}
      leinings={schedule.leinings.map((l) => ({
        id: l.id,
        aliyah: l.aliyah,
        memberId: l.memberId,
        member: l.member ? { id: l.member.id, firstName: l.member.firstName, lastName: l.member.lastName } : null,
      }))}
      kibbudim={schedule.kibbudim.map((k) => ({
        id: k.id,
        type: k.type,
        aliyahNumber: k.aliyahNumber,
        occasion: k.occasion,
        memberId: k.memberId,
        member: k.member ? { id: k.member.id, firstName: k.member.firstName, lastName: k.member.lastName } : null,
      }))}
      announcements={schedule.announcements.map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body,
      }))}
      members={members}
    />
  );
}
