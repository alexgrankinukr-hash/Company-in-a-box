"use client";

import { useEffect, useState } from "react";
import { getAgentColorClasses } from "@/lib/agent-colors";
import { useSSE } from "@/components/sse-provider";
import { cn, formatRelativeTime } from "@/lib/utils";

interface LogEntry {
  id: number;
  job_id: number;
  timestamp: string;
  message_type: string;
  agent_role: string;
  content: string;
}

export function ActivityStream() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { lastEvent } = useSSE();

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((d) => {
        if (d.recentLogs) {
          setLogs(d.recentLogs);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (lastEvent?.type === "new_logs" && Array.isArray(lastEvent.data)) {
      setLogs((prev) => {
        const newEntries = lastEvent.data as LogEntry[];
        const existingIds = new Set(prev.map((l) => l.id));
        const unique = newEntries.filter((l) => !existingIds.has(l.id));
        if (unique.length === 0) return prev;
        const merged = [...prev, ...unique];
        merged.sort((a, b) => b.id - a.id);
        return merged.slice(0, 100);
      });
    }
  }, [lastEvent]);

  if (logs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[13px] text-muted-foreground/40">
          No recent activity. Send a brief to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4">
        {logs.map((log) => {
          const colors = getAgentColorClasses(log.agent_role);
          const relTime = formatRelativeTime(log.timestamp);

          return (
            <div
              key={log.id}
              className="flex gap-3 border-b border-border py-2.5 last:border-0"
            >
              <div
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  colors.dot
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-[13px] font-medium", colors.text)}>
                    {log.agent_role
                      ? log.agent_role.length <= 4
                        ? log.agent_role.toUpperCase()
                        : log.agent_role
                            .split("-")
                            .map(
                              (w) => w.charAt(0).toUpperCase() + w.slice(1)
                            )
                            .join(" ")
                      : "System"}
                  </span>
                  <span className="text-[11px] text-muted-foreground/40">
                    {relTime}
                  </span>
                </div>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                  {log.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
