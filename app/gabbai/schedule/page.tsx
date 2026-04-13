import { prisma } from "@/lib/prisma";
import { formatHebrewDate, toHebrewDate } from "@/lib/hebrew";
import { ScheduleListClient } from "@/components/schedule/ScheduleListClient";
import { CreateScheduleForm } from "@/components/schedule/CreateScheduleForm";
import { SchedulePageHeader } from "@/components/schedule/SchedulePageHeader";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const rawSchedules = await prisma.shabbosSchedule.findMany({
    orderBy: { shabbosDate: "asc" },
    include: {
      _count: { select: { kibbudim: true, leinings: true } },
    },
    take: 20,
  });

  const now = new Date();

  const schedules = rawSchedules.map((schedule) => {
    const hdate = toHebrewDate(new Date(schedule.shabbosDate));
    const hebrewDateStr = formatHebrewDate(hdate);
    const isPast = new Date(schedule.shabbosDate) < now;
    const gregDate = new Date(schedule.shabbosDate).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return {
      id: schedule.id,
      parsha: schedule.parsha,
      hebrewDateStr,
      isPast,
      gregDate,
      leiningsCount: schedule._count.leinings,
      kibbudimCount: schedule._count.kibbudim,
    };
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <SchedulePageHeader />
        <CreateScheduleForm />
      </div>
      <ScheduleListClient schedules={schedules} />
    </div>
  );
}
