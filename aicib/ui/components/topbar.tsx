"use client";

import { usePathname } from "next/navigation";
import { useSSE } from "@/lib/sse";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "Tasks",
  "/costs": "Costs",
  "/activity": "Activity",
  "/agents": "Team",
  "/hr": "HR",
  "/knowledge": "Wiki",
  "/journal": "Journal",
  "/projects": "Projects",
  "/settings": "Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const { connected } = useSSE();

  const title = pageTitles[pathname] || "AICIB";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-medium text-foreground">{title}</h1>
        {pathname === "/" && (
          <span className="text-sm text-muted-foreground">
            AI Company overview
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            connected ? "bg-emerald-500" : "bg-red-500"
          )}
        />
        <span className="text-xs text-muted-foreground">
          {connected ? "Live" : "Disconnected"}
        </span>
      </div>
    </header>
  );
}
