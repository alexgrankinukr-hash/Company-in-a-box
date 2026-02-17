"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BriefInput() {
  const [directive, setDirective] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = directive.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directive: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send brief");
      } else {
        setDirective("");
      }
    } catch {
      setError("Network error");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex shrink-0 items-center gap-3 border-t border-border bg-background px-6 py-3"
    >
      <Input
        value={directive}
        onChange={(e) => setDirective(e.target.value)}
        placeholder="Send a brief to the CEO..."
        disabled={sending}
        className="flex-1 bg-muted/50"
      />
      <Button
        type="submit"
        size="sm"
        disabled={!directive.trim() || sending}
        className="gap-2"
      >
        <Send className="h-3.5 w-3.5" />
        {sending ? "Sending..." : "Send"}
      </Button>
      {error && (
        <span className="text-xs text-destructive">{error}</span>
      )}
    </form>
  );
}
