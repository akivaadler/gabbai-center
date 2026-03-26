import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MemberDonationsClient } from "@/components/portal/MemberDonationsClient";

export const dynamic = "force-dynamic";

export default async function MemberDonationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  if (!session.user.memberId) {
    return (
      <MemberDonationsClient
        donations={[]}
        ytdTotal={0}
        ytdCount={0}
        allTimeTotal={0}
        currentYear={new Date().getFullYear()}
        byYear={{}}
        noProfile={true}
      />
    );
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);

  const [rawDonations, ytdAggregate] = await Promise.all([
    prisma.donation.findMany({
      where: { memberId: session.user.memberId },
      orderBy: { date: "desc" },
      select: {
        id: true,
        amount: true,
        date: true,
        method: true,
        occasion: true,
        taxYear: true,
        receiptSent: true,
      },
    }),
    prisma.donation.aggregate({
      where: {
        memberId: session.user.memberId,
        date: { gte: startOfYear },
      },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  const ytdTotal = ytdAggregate._sum.amount ?? 0;
  const ytdCount = ytdAggregate._count.id;
  const donations = rawDonations.map((d) => ({
    id: d.id,
    amount: d.amount,
    date: d.date.toISOString(),
    method: d.method,
    occasion: d.occasion,
    taxYear: d.taxYear,
    receiptSent: d.receiptSent,
  }));

  const allTimeTotal = donations.reduce((sum, d) => sum + d.amount, 0);

  const byYear: Record<number, number> = {};
  for (const d of donations) {
    byYear[d.taxYear] = (byYear[d.taxYear] ?? 0) + d.amount;
  }

  return (
    <MemberDonationsClient
      donations={donations}
      ytdTotal={ytdTotal}
      ytdCount={ytdCount}
      allTimeTotal={allTimeTotal}
      currentYear={currentYear}
      byYear={byYear}
      noProfile={false}
    />
  );
}
