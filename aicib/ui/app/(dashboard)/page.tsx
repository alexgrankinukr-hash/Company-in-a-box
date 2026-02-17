"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KpiCards } from "@/components/kpi-cards";
import { AgentStatusGrid } from "@/components/agent-status-grid";
import { ActivityFeed } from "@/components/activity-feed";
import { QuickActions } from "@/components/quick-actions";
import { Button } from "@/components/ui/button";
import { Building2, Loader2, Play } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [sessionActive, setSessionActive] = useState<boolean | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/setup/status")
      .then((res) => res.json())
      .then((data) => {
        if (!data.configExists) {
          router.replace("/setup");
          return;
        }
        setSessionActive(data.sessionActive);
        setChecking(false);
      })
      .catch(() => {
        // If check fails, show dashboard normally
        setChecking(false);
      });
  }, [router]);

  async function handleStart() {
    setStarting(true);
    setStartError(null);
    try {
      const res = await fetch("/api/setup/start", { method: "POST" });
      if (res.ok) {
        // Give the session a moment to register in the DB
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setSessionActive(true);
      } else {
        const data = await res.json().catch(() => null);
        setStartError(data?.error || `Start failed (${res.status})`);
      }
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Failed to start");
    } finally {
      setStarting(false);
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* No-session banner */}
      {sessionActive === false && (
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Your AI company is ready
                </p>
                <p className="text-xs text-muted-foreground">
                  Start your team to begin working on briefs and managing your
                  business.
                </p>
              </div>
            </div>
            <Button onClick={handleStart} disabled={starting} className="gap-2">
              {starting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Company
                </>
              )}
            </Button>
          </div>
          {startError && (
            <p className="text-xs text-destructive mt-2 text-right">{startError}</p>
          )}
        </div>
      )}

      <KpiCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Agents</h2>
          <AgentStatusGrid />
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Recent Activity
          </h2>
          <div className="h-80 rounded-lg border border-border p-3">
            <ActivityFeed />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Quick Actions
        </h2>
        <QuickActions />
      </div>
    </div>
  );
}
