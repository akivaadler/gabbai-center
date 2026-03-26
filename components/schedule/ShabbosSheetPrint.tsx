"use client";

import { useEffect } from "react";
import { useLang } from "@/components/providers/LanguageProvider";

interface Leining {
  id: string;
  aliyah: string;
  memberName: string | null;
}

interface Kibbud {
  id: string;
  type: string;
  aliyahNumber: string | null;
  occasion: string | null;
  memberName: string | null;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
}

interface MinyanTime {
  id: string;
  name: string;
  time: string;
}

interface ShabbosSheetPrintProps {
  scheduleId: string;
  parsha: string | null;
  hebrewDateStr: string;
  shabbosDate: string;
  notes: string | null;
  leinings: Leining[];
  kibbudim: Kibbud[];
  announcements: Announcement[];
  minyanTimes: MinyanTime[];
}

const ALIYAH_LABELS_EN: Record<string, string> = {
  "1": "1st",
  "2": "2nd",
  "3": "3rd",
  "4": "4th",
  "5": "5th",
  "6": "6th",
  "7": "7th",
  MAFTIR: "Maftir",
  HAFTORAH: "Haftorah",
  SPECIAL: "Special",
};

const ALIYAH_LABELS_HE: Record<string, string> = {
  "1": "ראשון",
  "2": "שני",
  "3": "שלישי",
  "4": "רביעי",
  "5": "חמישי",
  "6": "שישי",
  "7": "שביעי",
  MAFTIR: "מפטיר",
  HAFTORAH: "הפטרה",
  SPECIAL: "מיוחד",
};

const KIBBUD_LABELS_EN: Record<string, string> = {
  ALIYAH: "Aliyah",
  PETICHAH: "Petichah",
  GELILAH: "Gelilah",
  HAGBAH: "Hagbah",
  ARON: "Aron",
  HAFTORAH: "Haftorah",
  LEINING: "Leining",
  OTHER: "Other",
};

const KIBBUD_LABELS_HE: Record<string, string> = {
  ALIYAH: "עלייה",
  PETICHAH: "פתיחה",
  GELILAH: "גלילה",
  HAGBAH: "הגבהה",
  ARON: "ארון",
  HAFTORAH: "הפטרה",
  LEINING: "קריאה",
  OTHER: "אחר",
};

export function ShabbosSheetPrint({
  parsha,
  hebrewDateStr,
  shabbosDate,
  notes,
  leinings,
  kibbudim,
  announcements,
  minyanTimes,
}: ShabbosSheetPrintProps) {
  const { t, lang, isRTL } = useLang();

  const ALIYAH_LABELS = lang === "he" ? ALIYAH_LABELS_HE : ALIYAH_LABELS_EN;
  const KIBBUD_LABELS = lang === "he" ? KIBBUD_LABELS_HE : KIBBUD_LABELS_EN;

  const locale = lang === "he" ? "he-IL" : "en-US";

  const gregDate = new Date(shabbosDate).toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Auto-print on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const aliyos = leinings.filter(
    (l) => !["MAFTIR", "HAFTORAH", "SPECIAL"].includes(l.aliyah)
  );
  const special = leinings.filter((l) =>
    ["MAFTIR", "HAFTORAH", "SPECIAL"].includes(l.aliyah)
  );

  return (
    <>
      {/* Screen-only: Print button + back link */}
      <div className="print:hidden fixed top-4 right-4 flex gap-2 z-50">
        <a
          href="javascript:history.back()"
          className="px-3 py-1.5 text-sm border rounded-md bg-white hover:bg-gray-50"
        >
          ← {t.schedule.back}
        </a>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 text-sm bg-navy-800 text-white rounded-md hover:bg-navy-700"
        >
          {t.print.print}
        </button>
      </div>

      {/* Print sheet */}
      <div
        className="max-w-[21cm] mx-auto p-8 bg-white text-black"
        dir={isRTL ? "rtl" : "ltr"}
        style={{ minHeight: "29.7cm" }}
      >
        {/* Header */}
        <div className="border-b-2 border-navy-900 pb-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy-900">
                {parsha ?? t.print.shabbosSheet}
              </h1>
              <p className="text-lg text-gray-600 mt-1">{gregDate}</p>
            </div>
            <div className="text-right">
              <p
                className="text-2xl font-bold text-navy-700"
                dir="rtl"
                lang="he"
                style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
              >
                {hebrewDateStr}
              </p>
              <p
                className="text-lg text-gray-500"
                dir="rtl"
                lang="he"
                style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
              >
                שבת שלום
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left column: Aliyos + Special */}
          <div>
            {/* Aliyos */}
            {aliyos.length > 0 && (
              <section className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-1 mb-3">
                  {t.print.aliyos}
                </h2>
                <table className="w-full text-sm">
                  <tbody>
                    {aliyos.map((l) => (
                      <tr key={l.id} className="border-b border-gray-100">
                        <td className="py-1.5 pr-4 font-medium text-gray-600 w-16">
                          {ALIYAH_LABELS[l.aliyah] ?? l.aliyah}
                        </td>
                        <td className="py-1.5 font-semibold">
                          {l.memberName ?? "—"}
                        </td>
                      </tr>
                    ))}
                    {special.map((l) => (
                      <tr key={l.id} className="border-b border-gray-100">
                        <td className="py-1.5 pr-4 font-medium text-gray-600 w-16">
                          {ALIYAH_LABELS[l.aliyah] ?? l.aliyah}
                        </td>
                        <td className="py-1.5 font-semibold">
                          {l.memberName ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Minyan Times */}
            {minyanTimes.length > 0 && (
              <section className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-1 mb-3">
                  {t.print.minyanTimes}
                </h2>
                <table className="w-full text-sm">
                  <tbody>
                    {minyanTimes.map((mt) => (
                      <tr key={mt.id} className="border-b border-gray-100">
                        <td className="py-1.5 pr-4 text-gray-700">{mt.name}</td>
                        <td className="py-1.5 font-semibold">{mt.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </div>

          {/* Right column: Kibbudim + Announcements */}
          <div>
            {/* Kibbudim */}
            {kibbudim.length > 0 && (
              <section className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-1 mb-3">
                  {t.print.kibbudim}
                </h2>
                <table className="w-full text-sm">
                  <tbody>
                    {kibbudim.map((k) => (
                      <tr key={k.id} className="border-b border-gray-100">
                        <td className="py-1.5 pr-4 text-gray-600 w-24">
                          {KIBBUD_LABELS[k.type] ?? k.type}
                          {k.aliyahNumber ? ` #${k.aliyahNumber}` : ""}
                        </td>
                        <td className="py-1.5 font-semibold">
                          {k.memberName ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Announcements */}
            {announcements.length > 0 && (
              <section className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-1 mb-3">
                  {t.print.announcements}
                </h2>
                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div key={a.id}>
                      <p className="font-semibold text-sm">{a.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{a.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <section className="mt-4 border-t pt-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
              {t.print.notes}
            </h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
          </section>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center">
          <p
            className="text-xl font-bold text-navy-900"
            dir="rtl"
            lang="he"
            style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
          >
            שבת שלום
          </p>
        </div>
      </div>

      {/* Print-only CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
