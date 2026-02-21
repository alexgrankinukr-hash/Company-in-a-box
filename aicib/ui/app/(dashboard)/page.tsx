"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SessionBanner } from "@/components/session-banner";
import {
  ChannelsList,
  type HomeChannelSummary,
} from "@/components/home/channels-list";
import {
  ChannelThread,
  type HomeThreadEntry,
} from "@/components/home/channel-thread";
import { ChannelComposer } from "@/components/home/channel-composer";
import { ContextPanel } from "@/components/home/context-panel";
import { useSSE } from "@/components/sse-provider";

interface StatusPayload {
  session?: { active?: boolean; sessionId?: string | null };
  agents?: Array<{ role: string; status: string }>;
  tasks?: Record<string, number>;
  costs?: {
    today?: number;
    month?: number;
    dailyLimit?: number;
    monthlyLimit?: number;
  };
  recentJobs?: Array<{
    id: number;
    directive: string;
    status: string;
    started_at: string | null;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { lastEvent } = useSSE();

  const [checking, setChecking] = useState(true);
  const [sessionActive, setSessionActive] = useState<boolean | null>(null);
  const [channels, setChannels] = useState<HomeChannelSummary[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [selectedChannelId, setSelectedChannelId] = useState("general");
  const [threadEntries, setThreadEntries] = useState<HomeThreadEntry[]>([]);
  const [threadLoading, setThreadLoading] = useState(true);
  const [statusData, setStatusData] = useState<StatusPayload | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

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
        setChecking(false);
      });
  }, [router]);

  const loadChannels = useCallback(async () => {
    setChannelsLoading(true);
    try {
      const res = await fetch("/api/channels", { cache: "no-store" });
      const data = (await res.json()) as { channels?: HomeChannelSummary[] };
      if (!res.ok) return;
      setChannels(data.channels || []);
    } catch {
      // Best-effort only.
    } finally {
      setChannelsLoading(false);
    }
  }, []);

  const loadThread = useCallback(async (channelId: string) => {
    setThreadLoading(true);
    try {
      const res = await fetch(`/api/channels/${channelId}/thread?pageSize=300`, {
        cache: "no-store",
      });
      const data = (await res.json()) as { entries?: HomeThreadEntry[] };
      if (!res.ok) return;
      setThreadEntries(data.entries || []);
    } catch {
      // Best-effort only.
    } finally {
      setThreadLoading(false);
    }
  }, []);

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as StatusPayload;
      setStatusData(data);
    } catch {
      // Best-effort only.
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    if (checking) return;
    loadChannels();
    loadStatus();
  }, [checking, loadChannels, loadStatus]);

  useEffect(() => {
    if (checking) return;
    loadThread(selectedChannelId);
  }, [checking, loadThread, selectedChannelId]);

  useEffect(() => {
    if (channels.length === 0) return;
    if (!channels.some((channel) => channel.id === selectedChannelId)) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  useEffect(() => {
    if (checking) return;
    if (!lastEvent) return;

    if (
      lastEvent.type === "new_logs" ||
      lastEvent.type === "agent_status" ||
      lastEvent.type === "cost_update" ||
      lastEvent.type === "task_update"
    ) {
      loadChannels();
      loadThread(selectedChannelId);
      loadStatus();
    }
  }, [checking, lastEvent, loadChannels, loadStatus, loadThread, selectedChannelId]);

  useEffect(() => {
    if (checking) return;
    const timer = setInterval(() => {
      loadChannels();
      loadThread(selectedChannelId);
      loadStatus();
    }, 5000);

    return () => clearInterval(timer);
  }, [checking, loadChannels, loadStatus, loadThread, selectedChannelId]);

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId) || null,
    [channels, selectedChannelId]
  );

  async function handleSendMessage(message: string): Promise<{
    ok: boolean;
    error?: string;
  }> {
    const directive =
      selectedChannelId === "general"
        ? message
        : `[channel:${selectedChannelId}] ${message}`;

    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directive }),
      });

      const payload = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!res.ok) {
        if (res.status === 409) {
          return {
            ok: false,
            error:
              payload?.error ||
              "Another brief is already running. Wait for it to finish first.",
          };
        }
        if (res.status === 400) {
          return {
            ok: false,
            error:
              payload?.error ||
              "No active session. Start the company session first.",
          };
        }
        return { ok: false, error: payload?.error || "Failed to send message" };
      }

      loadChannels();
      loadThread(selectedChannelId);
      loadStatus();
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error while sending message" };
    }
  }

  if (checking) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {sessionActive === false && (
        <SessionBanner onSessionStarted={() => setSessionActive(true)} />
      )}
      <div className="flex min-h-0 flex-1 flex-col px-5 py-4">
        <h1 className="text-lg font-semibold tracking-tight">Home</h1>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Communication hub for channel-based directives and execution follow-up.
        </p>

        <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-lg border border-border/80 bg-card xl:grid-cols-[240px_minmax(0,1fr)_300px]">
          <ChannelsList
            channels={channels}
            selectedChannelId={selectedChannelId}
            loading={channelsLoading}
            onSelect={setSelectedChannelId}
          />

          <div className="flex min-h-0 flex-1 flex-col border-t border-border/80 xl:border-t-0">
            <ChannelThread
              channelName={selectedChannel?.name || "#general"}
              entries={threadEntries}
              loading={threadLoading}
            />
            <ChannelComposer
              channelName={selectedChannel?.name || "#general"}
              disabled={sessionActive === false}
              onSend={handleSendMessage}
            />
          </div>

          <div className="hidden min-h-0 xl:block">
            <ContextPanel loading={statusLoading} data={statusData} />
          </div>
        </div>
      </div>
    </div>
  );
}
