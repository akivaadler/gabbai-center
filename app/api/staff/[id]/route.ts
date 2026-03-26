import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE — remove a staff account
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "GABBAI") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  // Prevent self-deletion
  if (params.id === session.user.id) {
    return Response.json({ error: "You cannot delete your own account" }, { status: 400 });
  }
  await prisma.user.delete({ where: { id: params.id } });
  return Response.json({ success: true });
}
