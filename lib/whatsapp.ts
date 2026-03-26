// WhatsApp via Twilio - uses 'whatsapp:' prefix on numbers
// Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER in .env.local
// The from number must be WhatsApp-enabled in Twilio sandbox or production

function formatIsraeliNumber(phone: string): string {
  // Normalize: remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("972")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+972${cleaned.slice(1)}`;
  return `+${cleaned}`;
}

function formatWhatsAppNumber(phone: string): string {
  const formatted = formatIsraeliNumber(phone);
  return `whatsapp:${formatted}`;
}

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Twilio credentials not configured");
  }

  if (process.env.TWILIO_WHATSAPP_ENABLED !== "true") {
    throw new Error("WhatsApp is not enabled. Set TWILIO_WHATSAPP_ENABLED=true");
  }

  const from = `whatsapp:${fromNumber}`;
  const toFormatted = to.startsWith("whatsapp:") ? to : formatWhatsAppNumber(to);

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams({
    From: from,
    To: toFormatted,
    Body: body,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message ?? "WhatsApp send failed");
  }
}

interface ShabbosSheetParams {
  phone: string;
  parsha: string;
  shabbosDate: string;
  shabbosHebrew?: string;
  minyanTimes: Array<{ name: string; time: string }>;
  announcements: Array<{ title: string; body: string }>;
  shulName: string;
}

export async function sendShabbosSheetWhatsApp(params: ShabbosSheetParams): Promise<void> {
  const { phone, parsha, shabbosDate, shabbosHebrew, minyanTimes, announcements, shulName } = params;

  const lines: string[] = [
    `*${shulName}* | *שבת שלום*`,
    "",
    `*Parshas ${parsha}*`,
    shabbosHebrew ? `_${shabbosHebrew}_` : "",
    `📅 ${shabbosDate}`,
    "",
  ];

  if (minyanTimes.length > 0) {
    lines.push("*⏰ Minyan Times:*");
    for (const mt of minyanTimes) {
      lines.push(`• ${mt.name}: ${mt.time}`);
    }
    lines.push("");
  }

  if (announcements.length > 0) {
    lines.push("*📢 Announcements:*");
    for (const ann of announcements) {
      lines.push(`• *${ann.title}*: ${ann.body}`);
    }
  }

  const body = lines.filter(Boolean).join("\n").trim();
  await sendWhatsApp(phone, body);
}
