import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MemberAnnouncementsClient } from "@/components/portal/MemberAnnouncementsClient";

export const dynamic = "force-dynamic";

export default async function MemberAnnouncementsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const now = new Date();

  const rawAnnouncements = await prisma.announcement.findMany({
    where: {
      isPublic: true,
      publishDate: { lte: now },
      OR: [{ expiresDate: null }, { expiresDate: { gt: now } }],
    },
    orderBy: { publishDate: "desc" },
    select: {
      id: true,
      title: true,
      body: true,
      publishDate: true,
      expiresDate: true,
    },
  });

  const announcements = rawAnnouncements.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    publishDate: a.publishDate.toISOString(),
    expiresDate: a.expiresDate ? a.expiresDate.toISOString() : null,
  }));

  return <MemberAnnouncementsClient announcements={announcements} />;
}
