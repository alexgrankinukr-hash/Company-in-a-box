"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAgentColorClasses } from "@/lib/agent-colors";
import { useSSE } from "@/lib/sse";
import { cn } from "@/lib/utils";

interface Agent {
  role: string;
  model: string;
  department: string;
  enabled: boolean;
  status: string;
  lastActivity: string | null;
  currentTask: string | null;
}

const statusDotColors: Record<string, string> = {
  idle: "bg-emerald-500",
  working: "bg-amber-500",
  error: "bg-red-500",
  stopped: "bg-zinc-500",
};

export function AgentStatusGrid() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const { lastEvent } = useSSE();

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((d) => {
        if (d.agents) setAgents(d.agents);
      })
      .catch(() => {});
  }, []);

  // Refresh agent statuses on SSE agent_status events
  useEffect(() => {
    if (lastEvent?.type === "agent_status") {
      fetch("/api/status")
        .then((res) => res.json())
        .then((d) => {
          if (d.agents) setAgents(d.agents);
        })
        .catch(() => {});
    }
  }, [lastEvent]);

  if (agents.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-8">
        <p className="text-sm text-muted-foreground">No agents configured</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => {
        const colors = getAgentColorClasses(agent.role);
        const dotColor = statusDotColors[agent.status] || "bg-zinc-500";

        return (
          <Card
            key={agent.role}
            className={cn("border-l-2", colors.border)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className={cn("text-sm font-medium", colors.text)}>
                  {agent.role}
                </span>
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", dotColor)} />
                  <span className="text-xs text-muted-foreground">
                    {agent.status}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {agent.model}
                </Badge>
                {agent.department !== agent.role && (
                  <span className="text-xs text-muted-foreground">
                    {agent.department}
                  </span>
                )}
              </div>

              {agent.currentTask && (
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {agent.currentTask}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
