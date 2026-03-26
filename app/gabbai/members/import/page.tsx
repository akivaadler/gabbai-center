import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ImportClient } from "@/components/members/ImportClient";

export default async function MembersImportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    redirect("/login");
  }

  return <ImportClient />;
}
