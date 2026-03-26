// ============================================================
// SMS via Twilio
// ============================================================
// Setup:
//   1. Sign up at https://www.twilio.com
//   2. Get a Twilio phone number (supports Israel +972)
//   3. Add to .env.local:
//        TWILIO_ACCOUNT_SID=ACxxxx
//        TWILIO_AUTH_TOKEN=xxxx
//        TWILIO_FROM_NUMBER=+1xxxxxxxxxx   (your Twilio number)
//
// Israeli numbers: stored as 05x-xxxxxxx or +9725xxxxxxxx
// This module normalizes both formats automatically.
// ============================================================

function isConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  );
}

/** Normalize Israeli and international phone numbers to E.164 */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("972"))  return `+${digits}`;
  if (digits.startsWith("0"))    return `+972${digits.slice(1)}`;
  if (digits.startsWith("1"))    return `+${digits}`;     // US
  if (digits.length >= 10)       return `+${digits}`;
  return phone; // pass through unrecognized
}

export async function sendSMS(to: string, body: string): Promise<void> {
  if (!isConfigured()) {
    console.log(`[SMS] Not configured — skipping message to ${to}:\n${body}`);
    return;
  }

  // Dynamic import keeps Twilio out of the client bundle
  const twilio = (await import("twilio")).default;
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );

  await client.messages.create({
    body,
    from: process.env.TWILIO_FROM_NUMBER!,
    to:   normalizePhone(to),
  });
}

// ── Typed SMS helpers ──────────────────────────────────────

export async function sendLeinerAssignmentSMS({
  memberName,
  memberPhone,
  shabbosDate,
  parsha,
  aliyah,
  shulName,
  lang = "en",
}: {
  memberName: string;
  memberPhone: string;
  shabbosDate: string;
  parsha: string | null;
  aliyah: string;
  shulName: string;
  lang?: "en" | "he";
}) {
  const aliyahLabel = formatAliyahLabel(aliyah, lang);
  const parshaText  = parsha ? (lang === "he" ? ` — פרשת ${parsha}` : ` — Parashat ${parsha}`) : "";

  const body =
    lang === "he"
      ? `${shulName}: ${memberName} שלום, הוקצה לך ${aliyahLabel} בשבת ${shabbosDate}${parshaText}. לפרטים פנה לגבאי.`
      : `${shulName}: Dear ${memberName}, you have been assigned ${aliyahLabel} on Shabbos ${shabbosDate}${parshaText}. Contact the gabbai with any questions.`;

  await sendSMS(memberPhone, body);
}

export async function sendYahrtzeitReminderSMS({
  memberName,
  memberPhone,
  deceasedName,
  daysAway,
  shulName,
  lang = "en",
}: {
  memberName: string;
  memberPhone: string;
  deceasedName: string;
  daysAway: number;
  shulName: string;
  lang?: "en" | "he";
}) {
  const body =
    lang === "he"
      ? `${shulName}: ${memberName} שלום, יארצייט של ${deceasedName} בעוד ${daysAway} ימים. נשמח לארגן לך עלייה.`
      : `${shulName}: Dear ${memberName}, the yahrtzeit for ${deceasedName} is in ${daysAway} day${daysAway !== 1 ? "s" : ""}. We'd be honored to arrange an aliyah for you.`;

  await sendSMS(memberPhone, body);
}

export async function sendBirthdayReminderSMS({
  memberName,
  memberPhone,
  daysAway,
  shulName,
  lang = "en",
}: {
  memberName: string;
  memberPhone: string;
  daysAway: number;
  shulName: string;
  lang?: "en" | "he";
}) {
  const body =
    lang === "he"
      ? `${shulName}: יום הולדת שמח, ${memberName}! מאחלים לך שנה טובה ומבורכת.`
      : `${shulName}: Dear ${memberName}, wishing you a happy Hebrew birthday${daysAway === 0 ? " today" : ` in ${daysAway} day${daysAway !== 1 ? "s" : ""}`}!`;

  await sendSMS(memberPhone, body);
}

export async function sendCustomSMS({
  memberPhone,
  message,
}: {
  memberPhone: string;
  message: string;
}) {
  await sendSMS(memberPhone, message);
}

// ── Helpers ────────────────────────────────────────────────

const ALIYAH_LABELS_EN: Record<string, string> = {
  "1":       "1st Aliyah (Kohen)",
  "2":       "2nd Aliyah (Levi)",
  "3":       "3rd Aliyah",
  "4":       "4th Aliyah",
  "5":       "5th Aliyah",
  "6":       "6th Aliyah",
  "7":       "7th Aliyah",
  MAFTIR:    "Maftir",
  HAFTORAH:  "Haftorah",
  SPECIAL:   "a special honor",
};

const ALIYAH_LABELS_HE: Record<string, string> = {
  "1":       "עלייה ראשונה (כהן)",
  "2":       "עלייה שנייה (לוי)",
  "3":       "עלייה שלישית",
  "4":       "עלייה רביעית",
  "5":       "עלייה חמישית",
  "6":       "עלייה שישית",
  "7":       "עלייה שביעית",
  MAFTIR:    "מפטיר",
  HAFTORAH:  "הפטרה",
  SPECIAL:   "כבוד מיוחד",
};

function formatAliyahLabel(aliyah: string, lang: "en" | "he"): string {
  const labels = lang === "he" ? ALIYAH_LABELS_HE : ALIYAH_LABELS_EN;
  return labels[aliyah] ?? aliyah;
}
