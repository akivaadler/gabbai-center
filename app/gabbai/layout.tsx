import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GabbaiSidebar } from "@/components/layout/GabbaiSidebar";
import { GabbaiHeader } from "@/components/layout/GabbaiHeader";

export default async function GabbaiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GABBAI") {
    redirect("/login");
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {/* Sidebar */}
      <GabbaiSidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <GabbaiHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
