import { prisma } from "@/lib/prisma";
import { verifyPayPlusWebhook } from "@/lib/payplus";

// PayPlus POSTs to this URL when a payment completes.
// Configure this URL in your PayPlus dashboard:
//   https://your-domain/api/payplus/callback
export async function POST(req: Request) {
  const rawBody  = await req.text();
  const signature = req.headers.get("x-payplus-signature");

  // In production, verify the signature
  if (process.env.NODE_ENV === "production" && !verifyPayPlusWebhook(rawBody, signature)) {
    return new Response("Invalid signature", { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // PayPlus sends transaction status in `data.status_code`
  // 000 = approved
  const statusCode = (payload.data as Record<string, unknown>)?.status_code as string | undefined;
  if (statusCode !== "000") {
    // Not an approved payment — acknowledge but don't record
    return new Response("ok");
  }

  const data        = payload.data as Record<string, unknown>;
  const amount      = parseFloat((data.amount as string | number).toString());
  const memberId    = data.more_info_1 as string | undefined;
  const occasion    = (data.more_info_2 as string | undefined) || null;
  const currency    = (data.currency_code as string | undefined) ?? "ILS";

  if (!memberId) {
    return new Response("Missing memberId", { status: 400 });
  }

  // Idempotency: skip if already recorded
  const txId = data.transaction_uid as string | undefined;
  if (txId) {
    const existing = await prisma.donation.findFirst({
      where: { notes: { contains: txId } },
    });
    if (existing) return new Response("ok");
  }

  await prisma.donation.create({
    data: {
      memberId,
      amount,
      currency,
      date:        new Date(),
      method:      "ONLINE",
      occasion,
      taxYear:     new Date().getFullYear(),
      receiptSent: false,
      notes:       txId ? `PayPlus txn: ${txId}` : "PayPlus payment",
    },
  });

  return new Response("ok");
}
