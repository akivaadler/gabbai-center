// ============================================================
// PayPlus Payment Integration
// ============================================================
// PayPlus (payplus.co.il) — modern Israeli payment gateway
// Supports: credit cards, bit, Apple Pay, Google Pay, NIS + USD
//
// Setup:
//   1. Register at https://payplus.co.il
//   2. Create a Payment Page in the PayPlus dashboard
//   3. Add to .env.local:
//        PAYPLUS_API_KEY=...
//        PAYPLUS_SECRET_KEY=...
//        PAYPLUS_PAGE_UID=...   (from your Payment Page)
//
// Flow:
//   1. Server creates a payment link via createPayPlusLink()
//   2. Client is redirected to the PayPlus hosted payment page
//   3. On completion, PayPlus POSTs to /api/payplus/callback
//   4. Callback creates the Donation record and sends receipt
// ============================================================

export interface PayPlusLinkResult {
  pageRequestUid: string;
  redirectUrl: string;
}

export async function createPayPlusLink({
  amount,
  currency = "ILS",
  description,
  memberId,
  occasion,
  successUrl,
  cancelUrl,
}: {
  amount: number;
  currency?: string;
  description: string;
  memberId: string;
  occasion?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<PayPlusLinkResult> {
  const apiKey    = process.env.PAYPLUS_API_KEY;
  const secretKey = process.env.PAYPLUS_SECRET_KEY;
  const pageUid   = process.env.PAYPLUS_PAGE_UID;

  if (!apiKey || !secretKey || !pageUid) {
    throw new Error("PayPlus credentials not configured. Set PAYPLUS_API_KEY, PAYPLUS_SECRET_KEY, PAYPLUS_PAGE_UID in .env.local");
  }

  const response = await fetch(
    "https://restapi.payplus.co.il/api/v1.0/PaymentPages/generateLink",
    {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        Authorization: JSON.stringify({ api_key: apiKey, secret_key: secretKey }),
      },
      body: JSON.stringify({
        payment_page_uid: pageUid,
        charge_method:    1,         // 1 = charge immediately
        currency_code:    currency,
        amount,
        sendEmailApproval: false,
        sendEmailFailure:  false,
        // pass-through metadata returned in webhook
        more_info:   description,
        more_info_1: memberId,
        more_info_2: occasion ?? "",
        success_url: successUrl,
        cancel_url:  cancelUrl,
        create_token: false,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPlus HTTP ${response.status}: ${text}`);
  }

  const data = await response.json();

  if (data.results?.status !== "success") {
    throw new Error(`PayPlus error: ${data.results?.message ?? JSON.stringify(data)}`);
  }

  return {
    pageRequestUid: data.data.page_request_uid,
    redirectUrl:    data.data.payment_page_link,
  };
}

// Verify the HMAC signature on incoming PayPlus webhooks
export function verifyPayPlusWebhook(
  body: string,
  signature: string | null
): boolean {
  if (!process.env.PAYPLUS_SECRET_KEY || !signature) return false;
  // PayPlus signs with HMAC-SHA256 of the raw body using the secret key
  const crypto = require("crypto") as typeof import("crypto");
  const expected = crypto
    .createHmac("sha256", process.env.PAYPLUS_SECRET_KEY)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex")
  );
}
