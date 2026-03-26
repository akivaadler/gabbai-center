import { prisma } from "@/lib/prisma";
import { getGregorianForCurrentYear } from "@/lib/hebrew";

export interface ReminderAlert {
  id: string;
  type: string;
  memberId: string;
  memberName: string;
  message: string; // English
  messageHe: string; // Hebrew
  severity: "info" | "warning" | "urgent";
  date?: Date;
}

export async function computeReminders(): Promise<ReminderAlert[]> {
  const alerts: ReminderAlert[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Load all active reminder rules and settings in parallel
  const [rules, settings] = await Promise.all([
    prisma.reminderRule.findMany({ where: { isActive: true } }),
    prisma.setting.findMany(),
  ]);

  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    settingsMap[s.key] = s.value;
  }

  // Helper to get threshold from rules or settings fallback
  const getThreshold = (type: string, fallback: number): number => {
    const rule = rules.find((r) => r.type === type);
    if (rule) return rule.thresholdDays;
    return fallback;
  };

  // ─── 1. NO_ALIYAH_IN_X_DAYS ──────────────────────────────────
  const noAliyahDays = getThreshold("NO_ALIYAH_IN_X_DAYS", parseInt(settingsMap["no_aliyah_threshold_days"] ?? "365", 10));
  const aliyahCutoff = new Date(now);
  aliyahCutoff.setDate(aliyahCutoff.getDate() - noAliyahDays);

  const activeMembers = await prisma.member.findMany({
    where: { isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      hebrewName: true,
      kibbudim: {
        where: { type: "ALIYAH" },
        orderBy: { date: "desc" },
        take: 1,
        select: { date: true },
      },
    },
  });

  for (const m of activeMembers) {
    const lastAliyah = m.kibbudim[0]?.date;
    if (!lastAliyah || new Date(lastAliyah) < aliyahCutoff) {
      const daysSince = lastAliyah
        ? Math.floor((now.getTime() - new Date(lastAliyah).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      alerts.push({
        id: `no-aliyah-${m.id}`,
        type: "NO_ALIYAH_IN_X_DAYS",
        memberId: m.id,
        memberName: `${m.firstName} ${m.lastName}`,
        message: daysSince
          ? `${m.firstName} ${m.lastName} has not had an aliyah in ${daysSince} days.`
          : `${m.firstName} ${m.lastName} has never had an aliyah.`,
        messageHe: daysSince
          ? `${m.hebrewName ?? `${m.firstName} ${m.lastName}`} לא קיבל עלייה מזה ${daysSince} ימים.`
          : `${m.hebrewName ?? `${m.firstName} ${m.lastName}`} מעולם לא קיבל עלייה.`,
        severity: daysSince && daysSince > noAliyahDays * 2 ? "urgent" : "warning",
      });
    }
  }

  // ─── 2. YAHRTZEIT_UPCOMING ────────────────────────────────────
  const yahrtzeitDays = getThreshold("YAHRTZEIT_UPCOMING", 14);
  const upcomingYahrtzeit = new Date(now);
  upcomingYahrtzeit.setDate(upcomingYahrtzeit.getDate() + yahrtzeitDays);

  const yahrtzeitEvents = await prisma.lifeEvent.findMany({
    where: { type: "YAHRTZEIT" },
    include: { member: { select: { id: true, firstName: true, lastName: true, hebrewName: true } } },
  });

  for (const ev of yahrtzeitEvents) {
    try {
      const gregDate = getGregorianForCurrentYear(ev.hebrewDay, ev.hebrewMonth);
      gregDate.setHours(0, 0, 0, 0);
      if (gregDate >= now && gregDate <= upcomingYahrtzeit) {
        const daysAway = Math.round((gregDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({
          id: `yahrtzeit-${ev.id}`,
          type: "YAHRTZEIT_UPCOMING",
          memberId: ev.memberId,
          memberName: `${ev.member.firstName} ${ev.member.lastName}`,
          message: `Yahrtzeit for ${ev.member.firstName} ${ev.member.lastName}${ev.label ? ` (${ev.label})` : ""} in ${daysAway} days.`,
          messageHe: `יארצייט עבור ${ev.member.hebrewName ?? `${ev.member.firstName} ${ev.member.lastName}`}${ev.label ? ` (${ev.label})` : ""} בעוד ${daysAway} ימים.`,
          severity: daysAway <= 3 ? "urgent" : "info",
          date: gregDate,
        });
      }
    } catch {
      // skip invalid dates
    }
  }

  // ─── 3. BIRTHDAY_UPCOMING ─────────────────────────────────────
  const birthdayDays = getThreshold("BIRTHDAY_UPCOMING", 14);
  const upcomingBirthday = new Date(now);
  upcomingBirthday.setDate(upcomingBirthday.getDate() + birthdayDays);

  const birthdayEvents = await prisma.lifeEvent.findMany({
    where: { type: "BIRTHDAY" },
    include: { member: { select: { id: true, firstName: true, lastName: true, hebrewName: true } } },
  });

  for (const ev of birthdayEvents) {
    try {
      const gregDate = getGregorianForCurrentYear(ev.hebrewDay, ev.hebrewMonth);
      gregDate.setHours(0, 0, 0, 0);
      if (gregDate >= now && gregDate <= upcomingBirthday) {
        const daysAway = Math.round((gregDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({
          id: `birthday-${ev.id}`,
          type: "BIRTHDAY_UPCOMING",
          memberId: ev.memberId,
          memberName: `${ev.member.firstName} ${ev.member.lastName}`,
          message: `Birthday for ${ev.member.firstName} ${ev.member.lastName} in ${daysAway} days.`,
          messageHe: `יום הולדת של ${ev.member.hebrewName ?? `${ev.member.firstName} ${ev.member.lastName}`} בעוד ${daysAway} ימים.`,
          severity: "info",
          date: gregDate,
        });
      }
    } catch {
      // skip invalid dates
    }
  }

  // ─── 4. ANNIVERSARY_UPCOMING ──────────────────────────────────
  const anniversaryDays = getThreshold("ANNIVERSARY_UPCOMING", 14);
  const upcomingAnniversary = new Date(now);
  upcomingAnniversary.setDate(upcomingAnniversary.getDate() + anniversaryDays);

  const anniversaryEvents = await prisma.lifeEvent.findMany({
    where: { type: "ANNIVERSARY" },
    include: { member: { select: { id: true, firstName: true, lastName: true, hebrewName: true } } },
  });

  for (const ev of anniversaryEvents) {
    try {
      const gregDate = getGregorianForCurrentYear(ev.hebrewDay, ev.hebrewMonth);
      gregDate.setHours(0, 0, 0, 0);
      if (gregDate >= now && gregDate <= upcomingAnniversary) {
        const daysAway = Math.round((gregDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({
          id: `anniversary-${ev.id}`,
          type: "ANNIVERSARY_UPCOMING",
          memberId: ev.memberId,
          memberName: `${ev.member.firstName} ${ev.member.lastName}`,
          message: `Anniversary for ${ev.member.firstName} ${ev.member.lastName}${ev.linkedMemberName ? ` & ${ev.linkedMemberName}` : ""} in ${daysAway} days.`,
          messageHe: `יום נישואין של ${ev.member.hebrewName ?? `${ev.member.firstName} ${ev.member.lastName}`} בעוד ${daysAway} ימים.`,
          severity: "info",
          date: gregDate,
        });
      }
    } catch {
      // skip invalid dates
    }
  }

  // ─── 5. BIG_DONOR ─────────────────────────────────────────────
  const bigDonorThreshold = parseFloat(settingsMap["bigDonorThreshold"] ?? "1000");
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const donorSums = await prisma.donation.groupBy({
    by: ["memberId"],
    where: { date: { gte: oneYearAgo } },
    _sum: { amount: true },
    having: { amount: { _sum: { gte: bigDonorThreshold } } },
  });

  if (donorSums.length > 0) {
    const donorMemberIds = donorSums.map((d) => d.memberId);
    const donorMembers = await prisma.member.findMany({
      where: { id: { in: donorMemberIds } },
      select: { id: true, firstName: true, lastName: true, hebrewName: true },
    });

    const memberMap = Object.fromEntries(donorMembers.map((m) => [m.id, m]));

    for (const ds of donorSums) {
      const m = memberMap[ds.memberId];
      if (!m) continue;
      const total = ds._sum.amount ?? 0;
      alerts.push({
        id: `big-donor-${m.id}`,
        type: "BIG_DONOR",
        memberId: m.id,
        memberName: `${m.firstName} ${m.lastName}`,
        message: `${m.firstName} ${m.lastName} has donated $${total.toFixed(2)} in the past year — consider recognition.`,
        messageHe: `${m.hebrewName ?? `${m.firstName} ${m.lastName}`} תרם $${total.toFixed(2)} בשנה האחרונה — שקול הכרת תודה.`,
        severity: "info",
      });
    }
  }

  // Sort: urgent first, then warning, then info
  const severityOrder = { urgent: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}
