interface MinyanTime {
  name: string;
  time: string;
}

interface Announcement {
  title: string;
  body: string;
}

interface ShabbosEmailParams {
  parsha: string;
  shabbosDate: string;
  shabbosHebrew: string;
  minyanTimes: MinyanTime[];
  announcements: Announcement[];
  shulName: string;
  shulAddress: string;
}

export function buildShabbosEmailHtml(params: ShabbosEmailParams): string {
  const { parsha, shabbosDate, shabbosHebrew, minyanTimes, announcements, shulName, shulAddress } = params;

  const minyanRows = minyanTimes
    .map(
      (mt) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-family: Arial, sans-serif; font-size: 14px; color: #374151;">${mt.name}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-family: Arial, sans-serif; font-size: 14px; color: #374151; text-align: right;">${mt.time}</td>
      </tr>`
    )
    .join("");

  const announcementItems = announcements
    .map(
      (a) => `
      <div style="margin-bottom: 12px; padding: 12px; background: #f9fafb; border-left: 3px solid #374151; border-radius: 4px;">
        <strong style="font-family: Arial, sans-serif; font-size: 14px; color: #111827;">${a.title}</strong>
        <p style="margin: 4px 0 0; font-family: Arial, sans-serif; font-size: 14px; color: #6b7280;">${a.body}</p>
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Shabbos Sheet — ${parsha}</title>
</head>
<body style="margin: 0; padding: 0; background: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: #111827; padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; font-family: Arial, sans-serif; font-size: 24px; color: #ffffff; font-weight: 700;">${shulName}</h1>
              <p style="margin: 8px 0 0; font-family: Arial, sans-serif; font-size: 14px; color: #9ca3af;">${shulAddress}</p>
            </td>
          </tr>

          <!-- Shabbos Info -->
          <tr>
            <td style="padding: 32px 32px 0;">
              <h2 style="margin: 0 0 4px; font-family: Arial, sans-serif; font-size: 20px; color: #111827;">Parshas ${parsha}</h2>
              <p style="margin: 0 0 4px; font-family: Arial, sans-serif; font-size: 14px; color: #6b7280;">${shabbosDate}</p>
              ${shabbosHebrew ? `<p style="margin: 0; font-family: 'David', 'Frank Ruhl Libre', serif; font-size: 16px; color: #374151; direction: rtl; text-align: right;">${shabbosHebrew}</p>` : ""}
            </td>
          </tr>

          <!-- Hebrew greeting -->
          <tr>
            <td style="padding: 16px 32px 0; text-align: center;">
              <p style="font-family: 'David', 'Frank Ruhl Libre', serif; font-size: 22px; color: #111827; direction: rtl;">שבת שלום!</p>
              <p style="font-family: Arial, sans-serif; font-size: 16px; color: #6b7280; margin-top: 0;">Good Shabbos!</p>
            </td>
          </tr>

          ${minyanTimes.length > 0 ? `
          <!-- Minyan Times -->
          <tr>
            <td style="padding: 24px 32px 0;">
              <h3 style="margin: 0 0 12px; font-family: Arial, sans-serif; font-size: 16px; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Minyan Times</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
                ${minyanRows}
              </table>
            </td>
          </tr>` : ""}

          ${announcements.length > 0 ? `
          <!-- Announcements -->
          <tr>
            <td style="padding: 24px 32px 0;">
              <h3 style="margin: 0 0 12px; font-family: Arial, sans-serif; font-size: 16px; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Announcements / הודעות</h3>
              ${announcementItems}
            </td>
          </tr>` : ""}

          <!-- Footer -->
          <tr>
            <td style="padding: 32px; text-align: center; border-top: 1px solid #e5e7eb; margin-top: 24px;">
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #9ca3af;">
                This email was sent by ${shulName} Gabbai Center.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
