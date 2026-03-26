"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLang } from "@/components/providers/LanguageProvider";
import { Upload, CheckCircle, XCircle, FileText } from "lucide-react";

interface ParsedRow {
  firstName: string;
  lastName: string;
  hebrewName: string;
  email: string;
  phone: string;
  address: string;
}

interface ImportResult {
  created: number;
  skipped: number;
  errors: string[];
}

// Column name aliases
const FIELD_ALIASES: Record<string, string> = {
  first_name: "firstName",
  firstname: "firstName",
  "first name": "firstName",
  last_name: "lastName",
  lastname: "lastName",
  "last name": "lastName",
  hebrew_name: "hebrewName",
  hebrewname: "hebrewName",
  "hebrew name": "hebrewName",
  email_address: "email",
  "email address": "email",
  phone_number: "phone",
  "phone number": "phone",
  mobile: "phone",
  tel: "phone",
  telephone: "phone",
  street: "address",
};

function normalizeKey(key: string): string {
  const lower = key.toLowerCase().trim();
  return FIELD_ALIASES[lower] ?? lower;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => normalizeKey(h.replace(/"/g, "").trim()));

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.replace(/^"|"$/g, "").trim());
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = values[i] ?? "";
    });
    return {
      firstName: row.firstName ?? "",
      lastName: row.lastName ?? "",
      hebrewName: row.hebrewName ?? "",
      email: row.email ?? "",
      phone: row.phone ?? "",
      address: row.address ?? "",
    };
  }).filter((row) => row.firstName || row.lastName);
}

export function ImportClient() {
  const { t } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError("");
    setParsed(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length === 0) {
          setParseError("No valid rows found in CSV.");
          return;
        }
        setParsed(rows);
      } catch {
        setParseError(t.import.parseError);
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!parsed || parsed.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/members/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: parsed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setParseError(data.error ?? t.common.error);
        return;
      }
      setResult(data);
      setParsed(null);
    } catch {
      setParseError(t.common.error);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t.import.title}</h1>
        <p className="text-sm text-muted-foreground">{t.import.csvFormat}</p>
      </div>

      {/* Upload Section */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t.import.uploadCsv}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            {fileName ? (
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                {fileName}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.import.selectFile}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Click to select a .csv file</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          {parseError && <p className="text-sm text-red-600 mt-2">{parseError}</p>}
        </CardContent>
      </Card>

      {/* Preview Table */}
      {parsed && parsed.length > 0 && (
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {t.import.preview} — {parsed.length} rows
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">First Name</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Last Name</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Hebrew Name</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {parsed.slice(0, 20).map((row, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      <td className="px-4 py-2">{row.firstName || <span className="text-red-500">—</span>}</td>
                      <td className="px-4 py-2">{row.lastName || <span className="text-red-500">—</span>}</td>
                      <td className="px-4 py-2" dir="rtl" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                        {row.hebrewName || "—"}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{row.email || "—"}</td>
                      <td className="px-4 py-2 text-muted-foreground">{row.phone || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.length > 20 && (
                <p className="px-4 py-2 text-xs text-muted-foreground">
                  ...and {parsed.length - 20} more rows
                </p>
              )}
            </div>

            <div className="p-4 border-t border-border flex justify-end">
              <Button
                onClick={handleImport}
                disabled={importing}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                {importing ? t.import.importing : `${t.import.confirm} ${parsed.length} members`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t.import.results}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <strong>{result.created}</strong> {t.import.created}
            </p>
            {result.skipped > 0 && (
              <p className="flex items-center gap-2 text-amber-600">
                <XCircle className="h-4 w-4" />
                <strong>{result.skipped}</strong> {t.import.skipped}
              </p>
            )}
            {result.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-600 mb-1">{t.import.errors}:</p>
                <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
