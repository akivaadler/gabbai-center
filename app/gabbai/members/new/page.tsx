import { MemberForm } from "@/components/members/MemberForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewMemberPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link
          href="/gabbai/members"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Members
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">New Member</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Member</CardTitle>
        </CardHeader>
        <CardContent>
          <MemberForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
