import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "pdf-lib";

interface DonationData {
  id: string;
  amount: number;
  date: Date;
  method: string;
  occasion: string | null;
  notes: string | null;
  taxYear: number;
}

interface MemberData {
  firstName: string;
  lastName: string;
}

interface ShulSettings {
  shulName: string;
  shulAddress: string;
  shulEin: string;
}

const METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  CHECK: "Check",
  CREDIT_CARD: "Credit Card",
  ONLINE: "Online",
  OTHER: "Other",
};

function drawCenteredText(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  fontSize: number,
  color = rgb(0, 0, 0)
) {
  const { width } = page.getSize();
  const textWidth = font.widthOfTextAtSize(text, fontSize);
  page.drawText(text, {
    x: (width - textWidth) / 2,
    y,
    size: fontSize,
    font,
    color,
  });
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  fontSize: number,
  color = rgb(0, 0, 0)
) {
  page.drawText(text, { x, y, size: fontSize, font, color });
}

export async function generateDonationReceipt(
  donation: DonationData,
  member: MemberData,
  settings: ShulSettings
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter
  const { width, height } = page.getSize();

  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Navy color (approximately #1e3a5f)
  const navyColor = rgb(0.118, 0.227, 0.373);
  const goldColor = rgb(0.741, 0.588, 0.122);
  const grayColor = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.85, 0.85, 0.85);

  const margin = 72; // 1 inch margins
  let y = height - margin;

  // ─── Header ────────────────────────────────────────────────────────────────
  // Shul name (large, centered, serif bold)
  drawCenteredText(page, settings.shulName, y, timesRomanBold, 28, navyColor);
  y -= 32;

  // Shul address (centered, smaller)
  drawCenteredText(page, settings.shulAddress, y, timesRoman, 12, grayColor);
  y -= 20;

  // EIN line
  const einLine = `Federal Tax ID: ${settings.shulEin}`;
  drawCenteredText(page, einLine, y, timesRoman, 11, grayColor);
  y -= 30;

  // Gold decorative line
  page.drawRectangle({
    x: margin,
    y: y - 2,
    width: width - margin * 2,
    height: 2,
    color: goldColor,
  });
  y -= 18;

  // "TAX RECEIPT" heading
  drawCenteredText(page, "TAX RECEIPT", y, timesRomanBold, 20, navyColor);
  y -= 14;

  // Navy thin line below heading
  page.drawRectangle({
    x: margin,
    y: y - 2,
    width: width - margin * 2,
    height: 1,
    color: lightGray,
  });
  y -= 26;

  // ─── Receipt Details Box ───────────────────────────────────────────────────
  const boxX = margin + 20;
  const boxWidth = width - margin * 2 - 40;
  const labelX = boxX + 16;
  const valueX = labelX + 180;
  const rowHeight = 26;

  const detailRows: [string, string][] = [
    ["Receipt #:", donation.id.substring(0, 8).toUpperCase()],
    [
      "Date:",
      new Date(donation.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    ],
    ["Tax Year:", donation.taxYear.toString()],
    ["Donor Name:", `${member.firstName} ${member.lastName}`],
    [
      "Amount:",
      `$${donation.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    ],
    ["Payment Method:", METHOD_LABELS[donation.method] ?? donation.method],
    ["Occasion / Purpose:", donation.occasion ?? "General Donation"],
  ];

  const boxHeight = detailRows.length * rowHeight + 24;
  const boxY = y - boxHeight;

  // Draw box background
  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    color: rgb(0.97, 0.97, 0.98),
    borderColor: lightGray,
    borderWidth: 1,
  });

  let rowY = y - 16;
  for (const [label, value] of detailRows) {
    drawText(page, label, labelX, rowY, helveticaBold, 10.5, grayColor);
    drawText(page, value, valueX, rowY, helvetica, 10.5);
    rowY -= rowHeight;
  }

  y = boxY - 30;

  // ─── Footer ────────────────────────────────────────────────────────────────
  // Divider
  page.drawRectangle({
    x: margin,
    y: y + 8,
    width: width - margin * 2,
    height: 1,
    color: lightGray,
  });

  // No goods/services statement
  const noGoodsText =
    "No goods or services were provided in exchange for this contribution.";
  const noGoodsWidth = timesRoman.widthOfTextAtSize(noGoodsText, 10);
  page.drawText(noGoodsText, {
    x: (width - noGoodsWidth) / 2,
    y,
    size: 10,
    font: timesRoman,
    color: grayColor,
  });
  y -= 18;

  // Thank you line
  const thankYouText = `Thank you for your generous support of ${settings.shulName}.`;
  const thankYouWidth = timesRomanBold.widthOfTextAtSize(thankYouText, 12);
  page.drawText(thankYouText, {
    x: (width - thankYouWidth) / 2,
    y,
    size: 12,
    font: timesRomanBold,
    color: navyColor,
  });
  y -= 40;

  // Generated date at bottom
  const generatedText = `Generated: ${new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}`;
  drawCenteredText(page, generatedText, y, helvetica, 9, grayColor);

  return pdfDoc.save();
}
