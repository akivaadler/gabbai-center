import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPayPlusLink } from "@/lib/payplus";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { memberId, amount, occasion, currency } = await req.json();

  if (!memberId || !amount || amount <= 0) {
    return Response.json({ error: "memberId and a positive amount are required" }, { status: 400 });
  }

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  try {
    const result = await createPayPlusLink({
      amount: parseFloat(amount),
      currency: currency ?? "ILS",
      description: occasion ? `Donation — ${occasion}` : "Donation",
      memberId,
      occasion,
      successUrl: `${base}/portal/donations?success=1`,
      cancelUrl:  `${base}/portal/donations?cancelled=1`,
    });
    return Response.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
