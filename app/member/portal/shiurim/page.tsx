import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShiurimPortalClient } from "@/components/shiurim/ShiurimPortalClient";

export default async function MemberShiurimPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const shiurim = await prisma.shiur.findMany({
    where: { isActive: true },
    orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
  });

  return <ShiurimPortalClient shiurim={shiurim} />;
}
