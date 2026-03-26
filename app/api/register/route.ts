import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/register - public endpoint for member self-registration via invite token
export async function POST(req: NextRequest) {
  try {
    const { token, firstName, lastName, hebrewName, email, password, phone } = await req.json();

    if (!token || !firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Validate token
    const invite = await prisma.inviteToken.findUnique({ where: { token } });

    if (!invite) {
      return NextResponse.json({ error: "Invalid invite token" }, { status: 400 });
    }
    if (invite.usedAt) {
      return NextResponse.json({ error: "Invite already used" }, { status: 400 });
    }
    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invite expired" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user + member in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: "MEMBER",
        },
      });

      await tx.member.create({
        data: {
          userId: newUser.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          hebrewName: hebrewName?.trim() || null,
          email,
          phone: phone?.trim() || null,
          isActive: true,
          memberSince: new Date(),
        },
      });

      await tx.inviteToken.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      });

      return newUser;
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
