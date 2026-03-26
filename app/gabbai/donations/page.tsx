import { prisma } from "@/lib/prisma";
import { DonationsClient } from "@/components/donations/DonationsClient";
import { DonationsPageHeader } from "@/components/donations/DonationsPageHeader";

export const dynamic = "force-dynamic";

export default async function DonationsPage() {
  const members = await prisma.member.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <DonationsPageHeader />
      <DonationsClient members={members} currentYear={currentYear} />
    </div>
  );
}
