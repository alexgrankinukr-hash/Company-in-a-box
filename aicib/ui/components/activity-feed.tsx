"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAgentColorClasses } from "@/lib/agent-colors";
import { useSSE } from "@/lib/sse";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: number;
  job_id: number;
  timestamp: string;
  message_type: string;
  agent_role: string;
  content: string;
}

export function ActivityFeed() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { lastEvent } = useSSE();

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((d) => {
        if (d.recentLogs) setLogs(d.recentLogs);
      })
      .catch(() => {});
  }, []);

  // Append new logs from SSE
  useEffect(() => {
    if (lastEvent?.type === "new_logs" && Array.isArray(lastEvent.data)) {
      setLogs((prev) => {
        const newEntries = lastEvent.data as LogEntry[];
        const existingIds = new Set(prev.map((l) => l.id));
        const unique = newEntries.filter((l) => !existingIds.has(l.id));
        const merged = [...unique, ...prev];
        return merged.slice(0, 50);
      });
    }
  }, [lastEvent]);

  if (logs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          No recent activity. Send a brief to get started.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 pr-4">
        {logs.map((log) => {
          const colors = getAgentColorClasses(log.agent_role);
          const time = log.timestamp?.split(" ")[1] || log.timestamp;

          return (
            <div key={log.id} className="flex gap-3 py-1.5">
              <div className="flex shrink-0 flex-col items-end pt-0.5">
                <span className="text-xs text-muted-foreground/60">
                  {time}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                {log.agent_role && (
                  <span
                    className={cn(
                      "text-xs font-medium",
                      colors.text
                    )}
                  >
                    {log.agent_role}
                  </span>
                )}
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {log.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
