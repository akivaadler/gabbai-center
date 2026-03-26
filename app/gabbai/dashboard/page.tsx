import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getUpcomingShabbos,
  getParshaForShabbos,
  formatHebrewDate,
  toHebrewDate,
  getGregorianForCurrentYear,
} from "@/lib/hebrew";
import { HDate } from "@hebcal/core";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const upcomingShabbos = getUpcomingShabbos();
  const parsha = getParshaForShabbos(upcomingShabbos);
  const shabbosHebrew = formatHebrewDate(toHebrewDate(upcomingShabbos));

  const shabbosDateStr = upcomingShabbos.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const startOfMonth = new Date(currentYear, now.getMonth(), 1);

  const [
    memberCount,
    activeCount,
    kibbudimThisMonth,
    nextShabbosSchedule,
    shabbosMinyanTimes,
    noAliyahThresholdSetting,
    allMembers,
    upcomingLifeEvents,
    donationsThisYear,
    donationsThisMonth,
    recentDonations,
    activeAnnouncements,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { isActive: true } }),
    prisma.kibbud.count({ where: { date: { gte: startOfMonth } } }),
    prisma.shabbosSchedule.findFirst({
      where: { shabbosDate: { gte: upcomingShabbos } },
      orderBy: { shabbosDate: "asc" },
      include: { _count: { select: { kibbudim: true, leinings: true } } },
    }),
    prisma.minyanTime.findMany({
      where: { dayOfWeek: "SHABBOS", isActive: true },
      orderBy: { time: "asc" },
    }),
    prisma.setting.findUnique({ where: { key: "no_aliyah_threshold_days" } }),
    prisma.member.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        kibbudim: {
          where: { type: "ALIYAH" },
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true },
        },
      },
    }),
    prisma.lifeEvent.findMany({
      where: { OR: [{ recurs: true }, { hebrewYear: null }] },
      include: { member: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.donation.aggregate({
      where: { date: { gte: startOfYear } },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.donation.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.donation.findMany({
      orderBy: { date: "desc" },
      take: 3,
      include: { member: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.announcement.findMany({
      where: {
        publishDate: { lte: now },
        OR: [{ expiresDate: null }, { expiresDate: { gt: now } }],
      },
      orderBy: { publishDate: "desc" },
      take: 5,
    }),
  ]);

  const thresholdDays = noAliyahThresholdSetting
    ? parseInt(noAliyahThresholdSetting.value, 10)
    : 365;

  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

  const membersNeedingAliyah = allMembers.filter((m) => {
    const lastAliyah = m.kibbudim[0]?.date;
    if (!lastAliyah) return true;
    return new Date(lastAliyah) < thresholdDate;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fourteenDaysOut = new Date(today);
  fourteenDaysOut.setDate(today.getDate() + 14);

  interface UpcomingEvent {
    id: string;
    memberId: string;
    memberName: string;
    type: string;
    label: string | null;
    gregorianDate: string;
    daysAway: number;
    hebrewMonth: number;
  }

  const upcoming14Days: UpcomingEvent[] = [];

  for (const event of upcomingLifeEvents) {
    try {
      let gregDate: Date;
      if (event.hebrewYear) {
        const hdate = new HDate(event.hebrewDay, event.hebrewMonth, event.hebrewYear);
        gregDate = hdate.greg();
      } else {
        gregDate = getGregorianForCurrentYear(event.hebrewDay, event.hebrewMonth);
        if (gregDate < today) {
          const currentHYear = new HDate().getFullYear();
          const hdate = new HDate(event.hebrewDay, event.hebrewMonth, currentHYear + 1);
          gregDate = hdate.greg();
        }
      }

      gregDate.setHours(0, 0, 0, 0);

      if (gregDate >= today && gregDate <= fourteenDaysOut) {
        const daysAway = Math.round(
          (gregDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        upcoming14Days.push({
          id: event.id,
          memberId: event.memberId,
          memberName: `${event.member.firstName} ${event.member.lastName}`,
          type: event.type,
          label: event.label,
          gregorianDate: gregDate.toISOString(),
          daysAway,
          hebrewMonth: event.hebrewMonth,
        });
      }
    } catch {
      // Skip invalid dates
    }
  }

  upcoming14Days.sort((a, b) => new Date(a.gregorianDate).getTime() - new Date(b.gregorianDate).getTime());

  const totalThisYear = donationsThisYear._sum.amount ?? 0;
  const totalThisMonth = donationsThisMonth._sum.amount ?? 0;
  const donationCount = donationsThisYear._count.id;

  return (
    <DashboardClient
      userEmail={session?.user?.email}
      shabbosDateStr={shabbosDateStr}
      shabbosHebrew={shabbosHebrew}
      parsha={parsha}
      memberCount={memberCount}
      activeCount={activeCount}
      kibbudimThisMonth={kibbudimThisMonth}
      totalThisYear={totalThisYear}
      totalThisMonth={totalThisMonth}
      donationCount={donationCount}
      currentYear={currentYear}
      recentDonations={recentDonations.map((d) => ({
        id: d.id,
        amount: d.amount,
        method: d.method,
        member: d.member,
      }))}
      activeAnnouncements={activeAnnouncements.map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body,
        expiresDate: a.expiresDate ? a.expiresDate.toISOString() : null,
      }))}
      nextShabbosSchedule={
        nextShabbosSchedule
          ? {
              id: nextShabbosSchedule.id,
              leiningsCount: nextShabbosSchedule._count.leinings,
              kibbudimCount: nextShabbosSchedule._count.kibbudim,
            }
          : null
      }
      shabbosMinyanTimes={shabbosMinyanTimes}
      membersNeedingAliyah={membersNeedingAliyah.map((m) => ({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        lastAliyahDate: m.kibbudim[0]?.date ? new Date(m.kibbudim[0].date).toISOString() : null,
      }))}
      thresholdDays={thresholdDays}
      upcoming14Days={upcoming14Days}
    />
  );
}
