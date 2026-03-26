import { prisma } from "@/lib/prisma";
import { AnnouncementsClient } from "@/components/announcements/AnnouncementsClient";
import { AnnouncementsPageHeader } from "@/components/announcements/AnnouncementsPageHeader";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const rawSchedules = await prisma.shabbosSchedule.findMany({
    select: { id: true, parsha: true, shabbosDate: true },
    orderBy: { shabbosDate: "desc" },
    take: 52,
  });

  // Convert Date to string for client component serialization
  const schedules = rawSchedules.map((s) => ({
    ...s,
    shabbosDate: s.shabbosDate.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <AnnouncementsPageHeader />
      <AnnouncementsClient schedules={schedules} />
    </div>
  );
}
