import nodemailer from "nodemailer";
import type { ReminderAlert } from "./reminders";

export function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function groupAlertsByType(alerts: ReminderAlert[]): Record<string, ReminderAlert[]> {
  const groups: Record<string, ReminderAlert[]> = {};
  for (const alert of alerts) {
    if (!groups[alert.type]) groups[alert.type] = [];
    groups[alert.type].push(alert);
  }
  return groups;
}

const TYPE_LABELS: Record<string, { en: string; he: string }> = {
  NO_ALIYAH_IN_X_DAYS: { en: "Members Without Recent Aliyah", he: "חברים ללא עלייה לאחרונה" },
  YAHRTZEIT_UPCOMING: { en: "Upcoming Yahrtzeits", he: "יארצייטים קרובים" },
  BIRTHDAY_UPCOMING: { en: "Upcoming Birthdays", he: "ימי הולדת קרובים" },
  ANNIVERSARY_UPCOMING: { en: "Upcoming Anniversaries", he: "ימי נישואין קרובים" },
  BIG_DONOR: { en: "Big Donor Recognition", he: "הכרת תודה לתורמים גדולים" },
};

const SEVERITY_COLORS: Record<string, string> = {
  urgent: "#dc2626",
  warning: "#d97706",
  info: "#2563eb",
};

export async function sendReminderDigest(alerts: ReminderAlert[], toEmail: string) {
  if (!process.env.SMTP_HOST || alerts.length === 0) return;

  const groups = groupAlertsByType(alerts);
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sections = Object.entries(groups)
    .map(([type, typeAlerts]) => {
      const label = TYPE_LABELS[type] ?? { en: type, he: type };
      const rows = typeAlerts
        .map(
          (a) => `
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">
              <span style="color: ${SEVERITY_COLORS[a.severity]}; font-weight: 600;">●</span>
              ${a.memberName}
            </td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">
              ${a.message}
            </td>
          </tr>`
        )
        .join("");

      return `
        <h3 style="color: #1e3a5f; margin: 24px 0 8px 0; font-size: 16px;">
          ${label.en} / <span dir="rtl" style="font-family: serif;">${label.he}</span>
        </h3>
        <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px; overflow: hidden;">
          <tbody>${rows}</tbody>
        </table>`;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; max-width: 700px; margin: 0 auto; padding: 24px; color: #111827;">
      <div style="background: #1e3a5f; color: white; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 22px;">Gabbai Center — Daily Digest</h1>
        <p style="margin: 4px 0 0; opacity: 0.8; font-size: 14px;">${date}</p>
        <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">${alerts.length} alert${alerts.length !== 1 ? "s" : ""} today</p>
      </div>
      <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        ${sections}
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px;">This is an automated digest from Gabbai Center. Log in to manage reminders.</p>
      </div>
    </body>
    </html>`;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: `Gabbai Center Daily Digest — ${date}`,
    html,
  });
}

export async function sendAliyahThankYouEmail({
  memberName,
  memberEmail,
  shulName,
  shabbosDate,
  parsha,
  portalUrl,
}: {
  memberName: string;
  memberEmail: string;
  shulName: string;
  shabbosDate: string;
  parsha: string | null;
  portalUrl: string;
}) {
  if (!process.env.SMTP_HOST) return;
  const transporter = getTransporter();
  const parshaText = parsha ? `for Parashat ${parsha} ` : "";
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1e3a5f;">${shulName}</h2>
      <p>Dear ${memberName},</p>
      <p>Thank you for receiving an aliyah ${parshaText}on ${shabbosDate}.</p>
      <p>If you would like to make a donation in honor of this occasion, you can do so through your member portal:</p>
      <p><a href="${portalUrl}/portal/donations" style="background: #b45309; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Make a Donation</a></p>
      <p>With warm regards,<br/>${shulName}</p>
    </div>
  `;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: memberEmail,
    subject: `Thank you for your aliyah — ${shulName}`,
    html,
  });
}

export async function sendDonationReceipt(
  memberEmail: string,
  pdfBuffer: Buffer,
  memberName: string
) {
  if (!process.env.SMTP_HOST) return;
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: memberEmail,
    subject: `Donation Receipt — ${memberName}`,
    text: `Dear ${memberName},\n\nPlease find your donation receipt attached.\n\nThank you for your generous support.\n\nGabbai Center`,
    attachments: [
      {
        filename: `receipt-${Date.now()}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}
