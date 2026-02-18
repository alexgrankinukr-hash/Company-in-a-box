"use client";

import { getAgentColorClasses } from "@/lib/agent-colors";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface Agent {
  role: string;
  model: string;
  department: string;
  enabled: boolean;
  status: string;
  currentTask: string | null;
}

interface LogEntry {
  id: number;
  job_id: number;
  timestamp: string;
  message_type: string;
  agent_role: string;
  content: string;
}

interface AgentPanelProps {
  agent: Agent | null;
  logs: LogEntry[];
  agents: Agent[];
  open: boolean;
  onClose: () => void;
}

const displayNames: Record<string, string> = {
  ceo: "CEO",
  cto: "CTO",
  cfo: "CFO",
  cmo: "CMO",
  "backend-engineer": "Backend Engineer",
  "frontend-engineer": "Frontend Engineer",
  "financial-analyst": "Financial Analyst",
  "content-writer": "Content Writer",
};

const statusLabels: Record<string, { label: string; className: string }> = {
  working: {
    label: "Working",
    className: "bg-emerald-500/20 text-emerald-400",
  },
  idle: { label: "Idle", className: "bg-zinc-500/20 text-zinc-400" },
  error: { label: "Error", className: "bg-red-500/20 text-red-400" },
  stopped: { label: "Stopped", className: "bg-zinc-700/20 text-zinc-500" },
};

function getReportsTo(agent: Agent): string | null {
  if (agent.role === "ceo") return null;
  if (agent.department === agent.role) return "CEO";
  return displayNames[agent.department] || agent.department.toUpperCase();
}

function getManages(agent: Agent, allAgents: Agent[]): string[] {
  if (agent.role === "ceo") {
    return allAgents
      .filter((a) => a.department === a.role && a.role !== "ceo")
      .map((a) => displayNames[a.role] || a.role);
  }
  return allAgents
    .filter((a) => a.department === agent.role && a.role !== agent.role)
    .map((a) => displayNames[a.role] || a.role);
}

export function AgentPanel({
  agent,
  logs,
  agents,
  open,
  onClose,
}: AgentPanelProps) {
  if (!agent) return null;

  const colors = getAgentColorClasses(agent.role);
  const name = displayNames[agent.role] || agent.role;
  const status = statusLabels[agent.status] || statusLabels.stopped;
  const reportsTo = getReportsTo(agent);
  const manages = getManages(agent, agents);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className={cn("h-3 w-3 rounded-full", colors.dot)} />
            <SheetTitle className="text-base">{name}</SheetTitle>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                status.className
              )}
            >
              {status.label}
            </span>
          </div>
          <SheetDescription className="text-[12px]">
            {agent.model} &middot; {agent.department} department
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-4">
          {agent.status === "working" && agent.currentTask && (
            <div>
              <h4 className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                Current Task
              </h4>
              <p className="text-[13px] text-foreground leading-relaxed">
                {agent.currentTask}
              </p>
            </div>
          )}

          <div>
            <h4 className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
              Relationships
            </h4>
            <div className="flex flex-col gap-1.5">
              {reportsTo && (
                <p className="text-[13px] text-muted-foreground">
                  Reports to:{" "}
                  <span className="text-foreground">{reportsTo}</span>
                </p>
              )}
              {manages.length > 0 && (
                <p className="text-[13px] text-muted-foreground">
                  Manages:{" "}
                  <span className="text-foreground">{manages.join(", ")}</span>
                </p>
              )}
              {!reportsTo && manages.length === 0 && (
                <p className="text-[13px] text-muted-foreground/40">
                  No direct reports
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
              Recent Activity
            </h4>
            {logs.length === 0 ? (
              <p className="text-[13px] text-muted-foreground/40">
                No recent activity
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-muted-foreground/40">
                      {formatRelativeTime(log.timestamp)}
                    </span>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      {log.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
