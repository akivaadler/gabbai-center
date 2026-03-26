import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/members/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // GABBAIs can view any member; MEMBERs can only view their own profile
  if (
    session.user.role !== "GABBAI" &&
    session.user.memberId !== params.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const member = await prisma.member.findUnique({
    where: { id: params.id },
    include: {
      lifeEvents: true,
      kibbudim: {
        orderBy: { date: "desc" },
        take: 10,
        include: {
          shabbosSchedule: { select: { parsha: true, shabbosDate: true } },
        },
      },
      donations: {
        orderBy: { date: "desc" },
        take: 10,
        ...(session.user.role !== "GABBAI"
          ? {
              select: {
                id: true,
                date: true,
                amount: true,
                occasion: true,
                method: true,
                taxYear: true,
                receiptSent: true,
              },
            }
          : {}),
      },
    },
  });

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Strip gabbai-only fields for member portal
  if (session.user.role !== "GABBAI") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { notes, ...publicMember } = member;
    return NextResponse.json(publicMember);
  }

  return NextResponse.json(member);
}

// PUT /api/members/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isGabbai = session.user.role === "GABBAI";
  const isOwnProfile = session.user.memberId === params.id;

  // GABBAIs can update any member; MEMBERs can only update their own record
  if (!isGabbai && !isOwnProfile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    // Members can only update allowed fields — never notes, isActive, or role
    const updateData: Record<string, unknown> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      hebrewName: hebrewName?.trim() || null,
      hebrewMotherName: hebrewMotherName?.trim() || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
    };

    if (isGabbai) {
      // Gabbaim can also update these fields
      updateData.memberSince = memberSince ? new Date(memberSince) : null;
      updateData.isActive = isActive ?? true;
      updateData.notes = notes?.trim() || null;
      updateData.preferences = preferences ?? null;
    }

    const member = await prisma.member.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("[PUT /api/members/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/members/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.member.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/members/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
