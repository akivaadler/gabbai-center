import { HDate, HebrewCalendar, gematriya, months, flags, MoladEvent } from "@hebcal/core";

// Hebrew month numbering: 1=Nisan, 2=Iyar, 3=Sivan, 4=Tammuz, 5=Av, 6=Elul,
// 7=Tishrei, 8=Cheshvan, 9=Kislev, 10=Tevet, 11=Shevat, 12=Adar/Adar I, 13=Adar II

export type HebrewMonthInfo = {
  num: number;
  nameEn: string;
  nameHe: string;
};

export const HEBREW_MONTHS: HebrewMonthInfo[] = [
  { num: 7,  nameEn: "Tishrei",   nameHe: "תשרי"   },
  { num: 8,  nameEn: "Cheshvan",  nameHe: "חשוון"  },
  { num: 9,  nameEn: "Kislev",    nameHe: "כסלו"   },
  { num: 10, nameEn: "Tevet",     nameHe: "טבת"    },
  { num: 11, nameEn: "Shevat",    nameHe: "שבט"    },
  { num: 12, nameEn: "Adar",      nameHe: "אדר"    },
  { num: 13, nameEn: "Adar II",   nameHe: "אדר ב'" },
  { num: 1,  nameEn: "Nisan",     nameHe: "ניסן"   },
  { num: 2,  nameEn: "Iyar",      nameHe: "אייר"   },
  { num: 3,  nameEn: "Sivan",     nameHe: "סיוון"  },
  { num: 4,  nameEn: "Tammuz",    nameHe: "תמוז"   },
  { num: 5,  nameEn: "Av",        nameHe: "אב"     },
  { num: 6,  nameEn: "Elul",      nameHe: "אלול"   },
];

/**
 * Returns HDate object for today
 */
export function getHebrewDateForToday(): HDate {
  return new HDate();
}

/**
 * Converts a recurring Hebrew date to Gregorian for the current Hebrew year.
 * @param hebrewDay - 1-30
 * @param hebrewMonth - 1=Nisan, 7=Tishrei, etc.
 */
export function getGregorianForCurrentYear(
  hebrewDay: number,
  hebrewMonth: number
): Date {
  const today = new HDate();
  const year = today.getFullYear();
  try {
    const hdate = new HDate(hebrewDay, hebrewMonth, year);
    return hdate.greg();
  } catch {
    // If day doesn't exist in month (e.g., day 30 in a short month), use day 29
    const hdate = new HDate(29, hebrewMonth, year);
    return hdate.greg();
  }
}

/**
 * Formats an HDate as a Hebrew script string with geresh/gershayim
 * e.g. "ד׳ ניסן תשפ״ו"
 */
export function formatHebrewDate(hdate: HDate): string {
  return hdate.renderGematriya();
}

/**
 * Formats an HDate as English string
 */
export function formatHebrewDateEnglish(hdate: HDate): string {
  const day = hdate.getDate();
  const monthName = hdate.getMonthName();
  const year = hdate.getFullYear();
  return `${day} ${monthName} ${year}`;
}

/**
 * Returns the parsha name for a given Shabbos date
 */
export function getParshaForShabbos(date: Date): string | null {
  try {
    const events = HebrewCalendar.calendar({
      start: date,
      end: date,
      mask: flags.PARSHA_HASHAVUA,
    });
    if (events.length > 0) {
      return events[0].render("en");
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Returns the next Shabbos (Saturday) date
 */
export function getUpcomingShabbos(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sunday, 6=Saturday
  const daysUntilShabbos = dayOfWeek === 6 ? 7 : 6 - dayOfWeek;
  const shabbos = new Date(now);
  shabbos.setDate(now.getDate() + daysUntilShabbos);
  shabbos.setHours(0, 0, 0, 0);
  return shabbos;
}

/**
 * Formats a number as Hebrew letters with geresh/gershayim
 */
export function formatHebrewNumber(num: number): string {
  return gematriya(num);
}

/**
 * Checks if a Hebrew year is a leap year (has Adar II)
 */
export function isHebrewLeapYear(year: number): boolean {
  return HDate.isLeapYear(year);
}

/**
 * Returns the current Hebrew year
 */
export function getCurrentHebrewYear(): number {
  return new HDate().getFullYear();
}

/**
 * Converts Gregorian date to HDate
 */
export function toHebrewDate(date: Date): HDate {
  return new HDate(date);
}

/**
 * Returns max days in a given Hebrew month + year
 */
export function daysInHebrewMonth(month: number, year: number): number {
  return HDate.daysInMonth(month, year);
}

// Re-export months enum for convenience
export { months };

/**
 * Returns today's zmanim (neitz, chatzot, shkia) from HebCal API.
 * Uses SHUL_GEONAME_ID env var (default: 281184 = Jerusalem).
 */
export async function getZmanim(date: Date): Promise<{
  neitz: string | null;
  chatzot: string | null;
  shkia: string | null;
} | null> {
  const geonameid = process.env.SHUL_GEONAME_ID ?? "281184";
  const dateStr = date.toISOString().split("T")[0];
  try {
    const res = await fetch(
      `https://www.hebcal.com/zmanim?cfg=json&geonameid=${geonameid}&date=${dateStr}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const times = data.times ?? {};
    const tzid: string = data.location?.tzid ?? "Asia/Jerusalem";
    const fmt = (iso: string | undefined): string | null => {
      if (!iso) return null;
      return new Date(iso).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: tzid,
      });
    };
    return {
      neitz: fmt(times.sunrise),
      chatzot: fmt(times.chatzot),
      shkia: fmt(times.sunset),
    };
  } catch {
    return null;
  }
}

/**
 * Returns Shabbos Mevarchim and Molad info for the given Shabbos date.
 */
export function getShabbosExtras(shabbosDate: Date): {
  isShabbosHaMevarchim: boolean;
  moladText: string | null;
} {
  try {
    const mevarchimEvents = HebrewCalendar.calendar({
      start: shabbosDate,
      end: shabbosDate,
      mask: flags.SHABBAT_MEVARCHIM,
    });
    if (mevarchimEvents.length === 0) {
      return { isShabbosHaMevarchim: false, moladText: null };
    }
    // Find the upcoming Rosh Chodesh (within 7 days)
    const end = new Date(shabbosDate);
    end.setDate(end.getDate() + 7);
    const rcEvents = HebrewCalendar.calendar({
      start: shabbosDate,
      end,
      mask: flags.ROSH_CHODESH,
    });
    const firstOfMonth = rcEvents.find((e) => e.getDate().getDate() === 1) ?? rcEvents[rcEvents.length - 1];
    if (!firstOfMonth) return { isShabbosHaMevarchim: true, moladText: null };
    const rc = firstOfMonth.getDate();
    const moladEvent = new MoladEvent(rc, rc.getFullYear(), rc.getMonth());
    return {
      isShabbosHaMevarchim: true,
      moladText: moladEvent.render("en"),
    };
  } catch {
    return { isShabbosHaMevarchim: false, moladText: null };
  }
}
