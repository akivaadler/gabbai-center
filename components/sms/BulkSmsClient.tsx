"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLang } from "@/components/providers/LanguageProvider";
import { MessageSquare, CheckCircle, XCircle } from "lucide-react";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
}

interface BulkSmsClientProps {
  members: Member[];
}

interface SendResult {
  sent: number;
  failed: number;
  errors: string[];
}

const SMS_LIMIT = 160;

export function BulkSmsClient({ members }: BulkSmsClientProps) {
  const { t, isRTL } = useLang();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState("");

  const membersWithPhone = members.filter((m) => m.phone);
  const filteredMembers = members.filter((m) => {
    if (!search) return true;
    const name = `${m.firstName} ${m.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  function toggleMember(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAllWithPhone() {
    setSelectedIds(new Set(membersWithPhone.map((m) => m.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function handleSend() {
    if (!message.trim()) {
      setError(t.sms.messageRequired);
      return;
    }
    if (selectedIds.size === 0) {
      setError(t.sms.noRecipientsSelected);
      return;
    }

    setSending(true);
    setError("");
    setResult(null);

    const memberIds = members
      .filter((m) => selectedIds.has(m.id) && m.phone)
      .map((m) => m.id);

    try {
      const res = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CUSTOM",
          message: message.trim(),
          memberIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.common.error);
        return;
      }

      setResult({ sent: data.sent ?? 0, failed: data.failed ?? 0, errors: data.errors ?? [] });
    } catch {
      setError(t.common.error);
    } finally {
      setSending(false);
    }
  }

  const charCount = message.length;
  const smsCount = Math.ceil(charCount / SMS_LIMIT) || 1;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t.sms.title}</h1>
        <p className="text-sm text-muted-foreground">{membersWithPhone.length} members with phone numbers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recipients Panel */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t.sms.recipients}</CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={selectAllWithPhone}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  {t.sms.selectAll}
                </button>
                {selectedIds.size > 0 && (
                  <button
                    onClick={clearSelection}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <Input
              placeholder={t.members.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {selectedIds.size} selected
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {filteredMembers.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(member.id)}
                    onChange={() => toggleMember(member.id)}
                    disabled={!member.phone}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className={!member.phone ? "text-muted-foreground" : ""}>
                    {member.firstName} {member.lastName}
                  </span>
                  {member.phone ? (
                    <span className="ml-auto text-xs text-muted-foreground">{member.phone}</span>
                  ) : (
                    <Badge variant="outline" className="ml-auto text-xs text-muted-foreground">
                      {t.sms.noPhone}
                    </Badge>
                  )}
                </label>
              ))}
              {filteredMembers.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">{t.members.noMembers}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Panel */}
        <div className="space-y-4">
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.sms.compose}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={6}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{charCount} {t.sms.charCount}</span>
                  <span>{smsCount} SMS {smsCount > 1 ? "messages" : "message"} per recipient</span>
                </div>
              </div>

              {charCount > SMS_LIMIT && (
                <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  Message exceeds 160 characters — will be split into {smsCount} SMS messages.
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              {result && (
                <div className="space-y-1 p-3 rounded-md bg-muted text-sm">
                  <p className="font-medium">{t.sms.results}</p>
                  <p className="flex items-center gap-1.5 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    {result.sent} {t.sms.sent}
                  </p>
                  {result.failed > 0 && (
                    <p className="flex items-center gap-1.5 text-red-600">
                      <XCircle className="h-4 w-4" />
                      {result.failed} {t.sms.failed}
                    </p>
                  )}
                </div>
              )}

              <Button
                onClick={handleSend}
                disabled={sending || selectedIds.size === 0 || !message.trim()}
                className="w-full bg-foreground text-background hover:bg-foreground/90"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {sending ? t.sms.sending : `${t.sms.send} (${selectedIds.size})`}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          {message && (
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t.sms.preview}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="bg-muted rounded-lg px-4 py-3 text-sm whitespace-pre-wrap max-h-32 overflow-y-auto"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  {message}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
