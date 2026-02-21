"use client";

import { ActivityStream } from "@/components/activity-stream";

export default function ActivityPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden px-5 py-4">
      <h1 className="mb-3 text-lg font-semibold tracking-tight">Logs</h1>
      <div className="min-h-0 flex-1 rounded-lg border border-border/80 bg-card">
        <ActivityStream />
      </div>
    </div>
  );
}
