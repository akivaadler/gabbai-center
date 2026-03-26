"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Printer } from "lucide-react";

interface QRData {
  bit: string | null;
  paybox: string | null;
}

export function PaymentQRCodes() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Donation");
  const [qrData, setQrData] = useState<QRData>({ bit: null, paybox: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateQR() {
    setLoading(true);
    setError("");
    setQrData({ bit: null, paybox: null });

    const amountNum = parseFloat(amount) || 0;
    const desc = description.trim() || "Donation";

    try {
      const [bitRes, payboxRes] = await Promise.allSettled([
        fetch("/api/qrcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "BIT", amount: amountNum, description: desc }),
        }).then((r) => r.json()),
        fetch("/api/qrcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "PAYBOX", amount: amountNum, description: desc }),
        }).then((r) => r.json()),
      ]);

      setQrData({
        bit: bitRes.status === "fulfilled" && bitRes.value.dataUrl ? bitRes.value.dataUrl : null,
        paybox: payboxRes.status === "fulfilled" && payboxRes.value.dataUrl ? payboxRes.value.dataUrl : null,
      });

      if (!qrData.bit && !qrData.paybox) {
        setError("No QR codes generated. Configure BIT_PHONE_NUMBER and PAYBOX_USER_ID in .env.local");
      }
    } catch {
      setError("Failed to generate QR codes");
    } finally {
      setLoading(false);
    }
  }

  const hasQR = qrData.bit || qrData.paybox;

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          Payment QR Codes (Bit / Paybox)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="qr-amount">Amount (optional)</Label>
            <Input
              id="qr-amount"
              type="number"
              step="1"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="qr-desc">Description</Label>
            <Input
              id="qr-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Donation"
            />
          </div>
        </div>

        <Button
          onClick={generateQR}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          <QrCode className="h-4 w-4 mr-2" />
          {loading ? "Generating..." : "Generate QR Codes"}
        </Button>

        {error && <p className="text-sm text-amber-600">{error}</p>}

        {hasQR && (
          <>
            <div className="grid grid-cols-2 gap-4">
              {qrData.bit && (
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">Bit</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrData.bit} alt="Bit QR Code" className="mx-auto border rounded" width={160} height={160} />
                  <p className="text-xs text-muted-foreground">Scan with Bit app</p>
                </div>
              )}
              {qrData.paybox && (
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">Paybox</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrData.paybox} alt="Paybox QR Code" className="mx-auto border rounded" width={160} height={160} />
                  <p className="text-xs text-muted-foreground">Scan with Paybox app</p>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="w-full"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print QR Codes
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
