import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET — list all staff (GABBAI) accounts
export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "GABBAI") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    where: { role: "GABBAI" },
    select: { id: true, email: true, role: true, createdAt: true, member: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "asc" },
  });
  return Response.json(users);
}

// POST — create a new GABBAI account
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "GABBAI") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, password, role = "GABBAI" } = await req.json();

  if (!email || !password) {
    return Response.json({ error: "Email and password are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (!["GABBAI", "MEMBER"].includes(role)) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "An account with this email already exists" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, role },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return Response.json(user, { status: 201 });
}
