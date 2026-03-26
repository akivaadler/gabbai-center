import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface MemberImportRow {
  firstName: string;
  lastName: string;
  hebrewName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// POST /api/members/import - bulk import members from CSV data (GABBAI only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "GABBAI") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { members }: { members: MemberImportRow[] } = await req.json();

    if (!Array.isArray(members) || members.length === 0) {
      return NextResponse.json({ error: "No members provided" }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of members) {
      try {
        if (!row.firstName?.trim() || !row.lastName?.trim()) {
          errors.push(`Row skipped: missing firstName or lastName`);
          skipped++;
          continue;
        }

        // Check for duplicate by email
        if (row.email?.trim()) {
          const existing = await prisma.member.findFirst({
            where: { email: row.email.trim() },
          });
          if (existing) {
            skipped++;
            continue;
          }
        }

        await prisma.member.create({
          data: {
            firstName: row.firstName.trim(),
            lastName: row.lastName.trim(),
            hebrewName: row.hebrewName?.trim() || null,
            email: row.email?.trim() || null,
            phone: row.phone?.trim() || null,
            address: row.address?.trim() || null,
            isActive: true,
          },
        });
        created++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        errors.push(`${row.firstName} ${row.lastName}: ${msg}`);
        skipped++;
      }
    }

    return NextResponse.json({ created, skipped, errors });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
