"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HebrewNameDisplay } from "@/components/hebrew/HebrewNameDisplay";
import { formatPhone } from "@/lib/utils";
import { useLang } from "@/components/providers/LanguageProvider";
import { Edit, Eye, Search } from "lucide-react";

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  hebrewName: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  memberSince: Date | string | null;
};

interface MemberTableProps {
  members: Member[];
}

export function MemberTable({ members }: MemberTableProps) {
  const [search, setSearch] = useState("");
  const { t, isRTL } = useLang();

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.firstName.toLowerCase().includes(q) ||
      m.lastName.toLowerCase().includes(q) ||
      (m.hebrewName?.toLowerCase().includes(q) ?? false) ||
      (m.email?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
        <Input
          placeholder={t.members.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={isRTL ? 'pr-10 text-right' : 'pl-10'}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className={`px-4 py-3 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{t.members.name}</th>
              <th className={`px-4 py-3 font-medium ${isRTL ? 'text-left' : 'text-right'}`}>{t.members.hebrewName}</th>
              <th className={`px-4 py-3 font-medium hidden md:table-cell ${isRTL ? 'text-right' : 'text-left'}`}>{t.members.email}</th>
              <th className={`px-4 py-3 font-medium hidden lg:table-cell ${isRTL ? 'text-right' : 'text-left'}`}>{t.members.phone}</th>
              <th className={`px-4 py-3 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{t.members.status}</th>
              <th className={`px-4 py-3 font-medium ${isRTL ? 'text-left' : 'text-right'}`}>{t.members.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {search ? t.members.noMembers : t.members.noMembers}
                </td>
              </tr>
            ) : (
              filtered.map((member) => (
                <tr key={member.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    {member.firstName} {member.lastName}
                  </td>
                  <td className={`px-4 py-3 ${isRTL ? 'text-left' : 'text-right'}`}>
                    <HebrewNameDisplay hebrewName={member.hebrewName} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {member.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {member.phone ? formatPhone(member.phone) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={member.isActive ? "success" : "secondary"}>
                      {member.isActive ? t.members.active : t.members.inactive}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/gabbai/members/${member.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/gabbai/members/${member.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground">
        {isRTL
          ? `מציג ${filtered.length} מתוך ${members.length} חברים`
          : `Showing ${filtered.length} of ${members.length} members`}
      </p>
    </div>
  );
}
