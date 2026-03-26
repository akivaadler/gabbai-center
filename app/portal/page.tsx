import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MemberPortalPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "GABBAI") {
    redirect("/gabbai/dashboard");
  }

  redirect("/member/portal/profile");
}
