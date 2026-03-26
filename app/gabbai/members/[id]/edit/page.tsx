import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MemberForm } from "@/components/members/MemberForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface EditMemberPageProps {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const member = await prisma.member.findUnique({
    where: { id: params.id },
  });

  if (!member) notFound();

  const memberSinceStr = member.memberSince
    ? new Date(member.memberSince).toISOString().split("T")[0]
    : "";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link
          href={`/gabbai/members/${params.id}`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          {member.firstName} {member.lastName}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">Edit</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Edit Member: {member.firstName} {member.lastName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MemberForm
            mode="edit"
            memberId={member.id}
            initialData={{
              firstName: member.firstName,
              lastName: member.lastName,
              hebrewName: member.hebrewName ?? "",
              hebrewMotherName: member.hebrewMotherName ?? "",
              email: member.email ?? "",
              phone: member.phone ?? "",
              address: member.address ?? "",
              memberSince: memberSinceStr,
              isActive: member.isActive,
              notes: member.notes ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
