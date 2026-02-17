"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ListTodo, DollarSign, Zap } from "lucide-react";
import { useSSE } from "@/lib/sse";
import { cn } from "@/lib/utils";

interface StatusData {
  agents: Array<{ status: string }>;
  costs: {
    today: number;
    dailyLimit: number;
  };
  tasks: {
    in_progress: number;
    in_review: number;
  };
  session: {
    active: boolean;
  };
}

export function KpiCards() {
  const [data, setData] = useState<StatusData | null>(null);
  const { lastEvent } = useSSE();

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  // Update on SSE events
  useEffect(() => {
    if (!lastEvent) return;
    if (
      lastEvent.type === "agent_status" ||
      lastEvent.type === "cost_update" ||
      lastEvent.type === "task_update"
    ) {
      // Re-fetch full status on relevant changes
      fetch("/api/status")
        .then((res) => res.json())
        .then((d) => setData(d))
        .catch(() => {});
    }
  }, [lastEvent]);

  const activeAgents = data
    ? data.agents.filter(
        (a) => a.status === "working" || a.status === "idle"
      ).length
    : 0;

  const activeTasks = data
    ? data.tasks.in_progress + data.tasks.in_review
    : 0;

  const todayCost = data?.costs.today ?? 0;
  const dailyLimit = data?.costs.dailyLimit ?? 50;
  const costRatio = dailyLimit > 0 ? todayCost / dailyLimit : 0;

  const costColor =
    costRatio > 0.8
      ? "text-red-400"
      : costRatio > 0.5
        ? "text-amber-400"
        : "text-emerald-400";

  const sessionActive = data?.session.active ?? false;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-agent-cto/10">
            <Users className="h-5 w-5 text-agent-cto" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Agents</p>
            <p className="text-2xl font-semibold">{activeAgents}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-agent-cmo/10">
            <ListTodo className="h-5 w-5 text-agent-cmo" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Tasks</p>
            <p className="text-2xl font-semibold">{activeTasks}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-agent-cfo/10">
            <DollarSign className="h-5 w-5 text-agent-cfo" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Today&apos;s Cost</p>
            <p className={cn("text-2xl font-semibold", costColor)}>
              ${todayCost.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-agent-ceo/10">
            <Zap className="h-5 w-5 text-agent-ceo" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Session</p>
            <Badge variant={sessionActive ? "default" : "secondary"}>
              {sessionActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
