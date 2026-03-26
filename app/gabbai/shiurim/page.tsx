import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShiurimClient } from "@/components/shiurim/ShiurimClient";

export default async function ShiurimPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    redirect("/login");
  }

  const shiurim = await prisma.shiur.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
  });

  return <ShiurimClient initialShiurim={shiurim} />;
}
