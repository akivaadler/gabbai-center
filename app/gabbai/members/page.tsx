import { prisma } from "@/lib/prisma";
import { MemberTable } from "@/components/members/MemberTable";
import { MembersPageHeader } from "@/components/members/MembersPageHeader";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      hebrewName: true,
      email: true,
      phone: true,
      isActive: true,
      memberSince: true,
    },
  });

  return (
    <div className="space-y-6">
      <MembersPageHeader count={members.length} />
      <MemberTable members={members} />
    </div>
  );
}
