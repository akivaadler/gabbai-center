import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MemberKibbudimClient } from "@/components/portal/MemberKibbudimClient";

export const dynamic = "force-dynamic";

export default async function MemberKibbudimPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  if (!session.user.memberId) {
    return <MemberKibbudimClient kibbudim={[]} noProfile={true} />;
  }

  const kibbudim = await prisma.kibbud.findMany({
    where: { memberId: session.user.memberId },
    orderBy: { date: "desc" },
    include: {
      shabbosSchedule: { select: { parsha: true } },
    },
  });

  const serialized = kibbudim.map((k) => ({
    id: k.id,
    type: k.type,
    aliyahNumber: k.aliyahNumber,
    occasion: k.occasion,
    date: k.date.toISOString(),
    shabbosSchedule: k.shabbosSchedule
      ? { parsha: k.shabbosSchedule.parsha }
      : null,
  }));

  return <MemberKibbudimClient kibbudim={serialized} noProfile={false} />;
}
