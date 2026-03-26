import { prisma } from "@/lib/prisma";
import { KibbudimPageClient } from "@/components/kibbudim/KibbudimPageClient";
import { KibbudimListClient } from "@/components/kibbudim/KibbudimListClient";

export const dynamic = "force-dynamic";

export default async function KibbudimPage() {
  const [members, kibbudim] = await Promise.all([
    prisma.member.findMany({
      where: { isActive: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.kibbud.findMany({
      orderBy: { date: "desc" },
      take: 50,
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
        shabbosSchedule: { select: { parsha: true, shabbosDate: true } },
      },
    }),
  ]);

  const serializedKibbudim = kibbudim.map((k) => ({
    id: k.id,
    type: k.type,
    aliyahNumber: k.aliyahNumber,
    occasion: k.occasion,
    date: new Date(k.date).toISOString(),
    member: k.member
      ? { id: k.member.id, firstName: k.member.firstName, lastName: k.member.lastName }
      : null,
    shabbosSchedule: k.shabbosSchedule
      ? {
          parsha: k.shabbosSchedule.parsha,
          shabbosDate: new Date(k.shabbosSchedule.shabbosDate).toISOString(),
        }
      : null,
  }));

  return (
    <div className="space-y-6 max-w-4xl">
      <KibbudimListClient members={members} kibbudim={serializedKibbudim} />
    </div>
  );
}
