import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MemberCard } from "@/components/members/MemberCard";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LifeEventsSection } from "@/components/members/LifeEventsSection";
import { KibbudimSection } from "@/components/members/KibbudimSection";
import { MemberDonationsSection } from "@/components/donations/MemberDonationsSection";

interface MemberPageProps {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export default async function MemberPage({ params }: MemberPageProps) {
  const [member, allMembers] = await Promise.all([
    prisma.member.findUnique({
      where: { id: params.id },
      include: {
        lifeEvents: { orderBy: { createdAt: "desc" } },
        kibbudim: {
          orderBy: { date: "desc" },
          take: 50,
          include: { shabbosSchedule: { select: { parsha: true, shabbosDate: true } } },
        },
        donations: {
          orderBy: { date: "desc" },
        },
      },
    }),
    prisma.member.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
  ]);

  if (!member) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/gabbai/members"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Members
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">
          {member.firstName} {member.lastName}
        </span>
      </div>

      {/* Main member card */}
      <MemberCard
        id={member.id}
        firstName={member.firstName}
        lastName={member.lastName}
        hebrewName={member.hebrewName}
        hebrewMotherName={member.hebrewMotherName}
        email={member.email}
        phone={member.phone}
        address={member.address}
        memberSince={member.memberSince}
        isActive={member.isActive}
        notes={member.notes}
      />

      {/* Life Events — full CRUD */}
      <LifeEventsSection
        memberId={member.id}
        initialEvents={member.lifeEvents}
      />

      {/* Kibbud History — full CRUD */}
      <KibbudimSection
        memberId={member.id}
        initialKibbudim={member.kibbudim}
      />

      {/* Donation History — full CRUD */}
      <MemberDonationsSection
        memberId={member.id}
        memberFirstName={member.firstName}
        memberLastName={member.lastName}
        initialDonations={member.donations.map((d) => ({
          ...d,
          date: d.date.toISOString(),
          createdAt: undefined,
          updatedAt: undefined,
          currency: d.currency ?? "USD",
          receiptPdf: undefined,
        }))}
        allMembers={allMembers}
      />
    </div>
  );
}
