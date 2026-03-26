"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/providers/LanguageProvider";
import { UserPlus } from "lucide-react";

interface MembersPageHeaderProps {
  count: number;
}

export function MembersPageHeader({ count }: MembersPageHeaderProps) {
  const { t } = useLang();
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">{t.members.title}</h1>
        <p className="text-muted-foreground">{count} {t.members.membersLabel}</p>
      </div>
      <Button asChild>
        <Link href="/gabbai/members/new">
          <UserPlus className="h-4 w-4 me-2" />
          {t.members.addMember}
        </Link>
      </Button>
    </div>
  );
}
