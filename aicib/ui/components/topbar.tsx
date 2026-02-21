"use client";

import { useEffect, useState } from "react";
import { useSSE } from "@/components/sse-provider";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { connected } = useSSE();
  const [companyName, setCompanyName] = useState("AICIB");

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((d) => {
        if (d.company?.name) setCompanyName(d.company.name);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border/70 bg-surface-raised/95 px-4 backdrop-blur">
      <span className="text-[13px] font-semibold text-foreground">
        {companyName}
      </span>

      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            connected ? "bg-emerald-500" : "bg-red-500"
          )}
        />
        <span className="text-[11px] text-muted-foreground">
          {connected ? "Live" : "Offline"}
        </span>
      </div>
    </header>
  );
}
