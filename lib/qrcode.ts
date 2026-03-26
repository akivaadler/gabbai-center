import QRCode from "qrcode";

// Generate Bit payment QR code
// Bit payment link format
export async function generateBitQR(amount: number, description: string, phone: string): Promise<string> {
  // Bit payment link - safe URL format
  const url = `https://www.bitpay.co.il/app/payment-link?amount=${amount}&description=${encodeURIComponent(description)}&phone=${encodeURIComponent(phone)}`;
  return QRCode.toDataURL(url, { width: 256, margin: 2 });
}

// Generate Paybox QR code
export async function generatePayboxQR(payboxUserId: string, amount: number, description: string): Promise<string> {
  const url = `https://payboxapp.page.link/pay?userId=${encodeURIComponent(payboxUserId)}&amount=${amount}&description=${encodeURIComponent(description)}`;
  return QRCode.toDataURL(url, { width: 256, margin: 2 });
}

// Generate generic QR code from any URL
export async function generateGenericQR(url: string): Promise<string> {
  return QRCode.toDataURL(url, { width: 256, margin: 2 });
}
