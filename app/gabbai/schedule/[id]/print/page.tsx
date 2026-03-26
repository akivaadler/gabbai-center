import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatHebrewDate, toHebrewDate } from "@/lib/hebrew";
import { ShabbosSheetPrint } from "@/components/schedule/ShabbosSheetPrint";

export const dynamic = "force-dynamic";

interface PrintPageProps {
  params: { id: string };
}

export default async function PrintPage({ params }: PrintPageProps) {
  const [schedule, shabbosMinyanTimes] = await Promise.all([
    prisma.shabbosSchedule.findUnique({
      where: { id: params.id },
      include: {
        leinings: {
          include: { member: { select: { firstName: true, lastName: true } } },
          orderBy: { aliyah: "asc" },
        },
        kibbudim: {
          include: { member: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: "asc" },
        },
        announcements: {
          where: {
            isPublic: true,
          },
          orderBy: { publishDate: "asc" },
        },
      },
    }),
    prisma.minyanTime.findMany({
      where: { dayOfWeek: "SHABBOS", isActive: true },
      orderBy: { time: "asc" },
    }),
  ]);

  if (!schedule) notFound();

  const hdate = toHebrewDate(new Date(schedule.shabbosDate));
  const hebrewDateStr = formatHebrewDate(hdate);

  return (
    <ShabbosSheetPrint
      scheduleId={schedule.id}
      parsha={schedule.parsha}
      hebrewDateStr={hebrewDateStr}
      shabbosDate={schedule.shabbosDate.toISOString()}
      notes={schedule.notes}
      leinings={schedule.leinings.map((l) => ({
        id: l.id,
        aliyah: l.aliyah,
        memberName: l.member ? `${l.member.firstName} ${l.member.lastName}` : null,
      }))}
      kibbudim={schedule.kibbudim.map((k) => ({
        id: k.id,
        type: k.type,
        aliyahNumber: k.aliyahNumber,
        occasion: k.occasion,
        memberName: k.member ? `${k.member.firstName} ${k.member.lastName}` : null,
      }))}
      announcements={schedule.announcements.map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body,
      }))}
      minyanTimes={shabbosMinyanTimes.map((mt) => ({
        id: mt.id,
        name: mt.name,
        time: mt.time,
      }))}
    />
  );
}
