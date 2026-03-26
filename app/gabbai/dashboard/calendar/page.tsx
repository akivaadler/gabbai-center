import { prisma } from "@/lib/prisma";
import { getGregorianForCurrentYear } from "@/lib/hebrew";
import { HDate } from "@hebcal/core";
import { CalendarPageClient } from "@/components/calendar/CalendarPageClient";

export const dynamic = "force-dynamic";

const EVENT_TYPE_COLORS: Record<string, string> = {
  BIRTHDAY: "bg-blue-100 text-blue-800",
  ANNIVERSARY: "bg-pink-100 text-pink-800",
  BAR_MITZVAH: "bg-gold-100 text-gold-800",
  YAHRTZEIT: "bg-gray-100 text-gray-800",
  OTHER: "bg-purple-100 text-purple-800",
};

interface UpcomingEvent {
  id: string;
  memberId: string;
  memberName: string;
  type: string;
  colorClass: string;
  label: string | null;
  linkedMemberName: string | null;
  hebrewDay: number;
  hebrewMonth: number;
  hebrewMonthNameHe: string;
  gregorianDate: string;
  daysAway: number;
}

export default async function CalendarPage() {
  const allEvents = await prisma.lifeEvent.findMany({
    include: {
      member: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    where: {
      OR: [{ recurs: true }, { hebrewYear: null }],
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysOut = new Date(today);
  thirtyDaysOut.setDate(today.getDate() + 30);

  // Hebrew month names for display
  const HEBREW_MONTH_NAMES: Record<number, string> = {
    1: "ניסן", 2: "אייר", 3: "סיוון", 4: "תמוז", 5: "אב", 6: "אלול",
    7: "תשרי", 8: "חשון", 9: "כסלו", 10: "טבת", 11: "שבט", 12: "אדר", 13: "אדר ב׳",
  };

  const upcoming: UpcomingEvent[] = [];

  for (const event of allEvents) {
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

      if (gregDate >= today && gregDate <= thirtyDaysOut) {
        const daysAway = Math.round(
          (gregDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        upcoming.push({
          id: event.id,
          memberId: event.memberId,
          memberName: `${event.member.firstName} ${event.member.lastName}`,
          type: event.type,
          colorClass: EVENT_TYPE_COLORS[event.type] ?? "bg-gray-100 text-gray-800",
          label: event.label,
          linkedMemberName: event.linkedMemberName,
          hebrewDay: event.hebrewDay,
          hebrewMonth: event.hebrewMonth,
          hebrewMonthNameHe: HEBREW_MONTH_NAMES[event.hebrewMonth] ?? "",
          gregorianDate: gregDate.toISOString(),
          daysAway,
        });
      }
    } catch {
      // Skip invalid dates
    }
  }

  upcoming.sort((a, b) => new Date(a.gregorianDate).getTime() - new Date(b.gregorianDate).getTime());

  return <CalendarPageClient upcoming={upcoming} />;
}
