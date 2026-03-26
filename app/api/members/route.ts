import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/members - list all members (GABBAI only)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const activeOnly = searchParams.get("active") === "true";

  const members = await prisma.member.findMany({
    where: {
      isActive: activeOnly ? true : undefined,
      OR: search
        ? [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { hebrewName: { contains: search } },
            { email: { contains: search } },
          ]
        : undefined,
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return NextResponse.json(members);
}

// POST /api/members - create member (GABBAI only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
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
      preferences,
    } = body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    const member = await prisma.member.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        hebrewName: hebrewName?.trim() || null,
        hebrewMotherName: hebrewMotherName?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        memberSince: memberSince ? new Date(memberSince) : null,
        isActive: isActive ?? true,
        notes: notes?.trim() || null,
        preferences: preferences ?? null,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("[POST /api/members]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
