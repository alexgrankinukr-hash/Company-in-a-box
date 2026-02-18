"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BriefInputProps {
  disabled?: boolean;
}

export function BriefInput({ disabled }: BriefInputProps) {
  const [directive, setDirective] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasText = directive.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = directive.trim();
    if (!trimmed || sending || disabled) return;

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
      className="flex shrink-0 items-center gap-2 border-b border-border bg-surface-raised px-4 py-2.5"
    >
      <input
        value={directive}
        onChange={(e) => setDirective(e.target.value)}
        placeholder="What should the team work on?"
        disabled={sending || disabled}
        className={cn(
          "flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none",
          "rounded-md border border-transparent px-3 py-2",
          "focus:border-agent-ceo/40 focus:ring-1 focus:ring-agent-ceo/30",
          disabled && "cursor-not-allowed opacity-50"
        )}
      />
      <button
        type="submit"
        disabled={!hasText || sending || disabled}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
          hasText && !disabled
            ? "bg-agent-ceo text-white hover:bg-agent-ceo/80"
            : "bg-transparent text-muted-foreground/30"
        )}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      {error && (
        <span className="text-[11px] text-destructive">{error}</span>
      )}
    </form>
  );
}
