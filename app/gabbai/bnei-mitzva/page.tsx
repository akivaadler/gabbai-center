import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BneiMitzvaClient } from "@/components/bnei-mitzva/BneiMitzvaClient";
import { HDate } from "@hebcal/core";

function hebrewDateToGregorian(hebrewDay: number, hebrewMonth: number): Date | null {
  try {
    const currentYear = new HDate().getFullYear();
    const hdate = new HDate(hebrewDay, hebrewMonth, currentYear);
    return hdate.greg();
  } catch {
    return null;
  }
}

export default async function BneiMitzvaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    redirect("/login");
  }

  const events = await prisma.lifeEvent.findMany({
    where: { type: "BAR_MITZVAH" },
    include: {
      member: {
        select: { id: true, firstName: true, lastName: true, hebrewName: true },
      },
    },
    orderBy: [{ hebrewMonth: "asc" }, { hebrewDay: "asc" }],
  });

  const eventsWithDates = events.map((event) => {
    const gregorian = hebrewDateToGregorian(event.hebrewDay, event.hebrewMonth);
    return {
      ...event,
      gregorianDate: gregorian ? gregorian.toISOString() : null,
    };
  });

  // Sort by upcoming gregorian date
  const now = new Date();
  eventsWithDates.sort((a, b) => {
    if (!a.gregorianDate || !b.gregorianDate) return 0;
    const aDate = new Date(a.gregorianDate);
    const bDate = new Date(b.gregorianDate);
    // Days from now (wrapping around year)
    const aDiff = (aDate.getTime() - now.getTime() + 365 * 24 * 60 * 60 * 1000) % (365 * 24 * 60 * 60 * 1000);
    const bDiff = (bDate.getTime() - now.getTime() + 365 * 24 * 60 * 60 * 1000) % (365 * 24 * 60 * 60 * 1000);
    return aDiff - bDiff;
  });

  return <BneiMitzvaClient events={eventsWithDates} />;
}
