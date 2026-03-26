import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BulkSmsClient } from "@/components/sms/BulkSmsClient";

export default async function SmsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    redirect("/login");
  }

  const members = await prisma.member.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true, phone: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return <BulkSmsClient members={members} />;
}
