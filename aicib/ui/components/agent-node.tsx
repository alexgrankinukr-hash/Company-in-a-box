"use client";

import { forwardRef } from "react";
import { getAgentColorClasses } from "@/lib/agent-colors";
import { cn } from "@/lib/utils";

interface AgentNodeProps {
  role: string;
  status: string;
  hexColor: string;
  onClick: () => void;
}

const displayNames: Record<string, string> = {
  ceo: "CEO",
  cto: "CTO",
  cfo: "CFO",
  cmo: "CMO",
  "backend-engineer": "Backend Eng.",
  "frontend-engineer": "Frontend Eng.",
  "financial-analyst": "Analyst",
  "content-writer": "Writer",
};

export const AgentNode = forwardRef<HTMLDivElement, AgentNodeProps>(
  function AgentNode({ role, status, hexColor, onClick }, ref) {
    const colors = getAgentColorClasses(role);
    const name = displayNames[role] || role;

    return (
      <div
        ref={ref}
        onClick={onClick}
        className="flex flex-col items-center gap-1.5 cursor-pointer group"
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-all",
            status === "working" &&
              "animate-[glow-ring_2s_ease-in-out_infinite]",
            status === "error" && "ring-2 ring-red-500/60",
            status === "stopped" && "opacity-40"
          )}
          style={
            status === "working"
              ? ({ "--glow-color": hexColor } as React.CSSProperties)
              : undefined
          }
        >
          <div className={cn("h-3 w-3 rounded-full", colors.dot)} />
        </div>
        <span
          className={cn(
            "text-[11px] text-muted-foreground group-hover:text-foreground transition-colors",
            status === "stopped" && "opacity-40"
          )}
        >
          {name}
        </span>
      </div>
    );
  }
);
