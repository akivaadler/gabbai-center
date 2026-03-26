import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HebrewNameDisplay } from "@/components/hebrew/HebrewNameDisplay";
import { formatPhone, formatDate } from "@/lib/utils";
import { Mail, Phone, MapPin, Calendar, Edit } from "lucide-react";

type MemberCardProps = {
  id: string;
  firstName: string;
  lastName: string;
  hebrewName: string | null;
  hebrewMotherName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  memberSince: Date | string | null;
  isActive: boolean;
  notes: string | null;
};

export function MemberCard({
  id,
  firstName,
  lastName,
  hebrewName,
  hebrewMotherName,
  email,
  phone,
  address,
  memberSince,
  isActive,
  notes,
}: MemberCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">
              {firstName} {lastName}
            </CardTitle>
            {hebrewName && (
              <div className="mt-1">
                <HebrewNameDisplay hebrewName={hebrewName} size="lg" />
              </div>
            )}
            {hebrewMotherName && (
              <div className="mt-0.5 text-sm text-muted-foreground">
                <span className="mr-1">בן/בת:</span>
                <HebrewNameDisplay hebrewName={hebrewMotherName} size="sm" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? "success" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link href={`/gabbai/members/${id}/edit`}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <a href={`mailto:${email}`} className="hover:underline text-primary">
              {email}
            </a>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <a href={`tel:${phone}`} className="hover:underline">
              {formatPhone(phone)}
            </a>
          </div>
        )}
        {address && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{address}</span>
          </div>
        )}
        {memberSince && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>Member since {formatDate(memberSince)}</span>
          </div>
        )}
        {notes && (
          <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs font-medium text-amber-800 mb-1">Gabbai Notes</p>
            <p className="text-sm text-amber-900 whitespace-pre-wrap">{notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
