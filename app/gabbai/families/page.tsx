import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FamiliesClient } from "@/components/families/FamiliesClient";

export default async function FamiliesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    redirect("/login");
  }

  const [families, members] = await Promise.all([
    prisma.family.findMany({
      include: {
        members: {
          select: { id: true, firstName: true, lastName: true, isActive: true },
          orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.member.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, familyId: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
  ]);

  return <FamiliesClient initialFamilies={families} allMembers={members} />;
}
