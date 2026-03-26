import { prisma } from "@/lib/prisma";
import { MinyanPageClient } from "@/components/minyan/MinyanPageClient";

export const dynamic = "force-dynamic";

const DAY_ORDER = ["0", "1", "2", "3", "4", "5", "6", "SHABBOS", "YOM_TOV"];

export default async function MinyanPage() {
  const times = await prisma.minyanTime.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
  });

  // Group by day
  const grouped: Record<string, typeof times> = {};
  for (const t of times) {
    if (!grouped[t.dayOfWeek]) grouped[t.dayOfWeek] = [];
    grouped[t.dayOfWeek].push(t);
  }

  // Build ordered groups for serialization
  const orderedGroups = DAY_ORDER.filter((d) => grouped[d]).map((dayKey) => ({
    dayKey,
    times: grouped[dayKey].map((t) => ({
      id: t.id,
      name: t.name,
      dayOfWeek: t.dayOfWeek,
      time: t.time,
      isActive: t.isActive,
    })),
  }));

  return <MinyanPageClient orderedGroups={orderedGroups} hasAnyTimes={times.length > 0} />;
}
