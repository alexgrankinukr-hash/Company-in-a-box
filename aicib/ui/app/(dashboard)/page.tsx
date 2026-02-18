"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { OrgChart } from "@/components/org-chart";
import { SessionBanner } from "@/components/session-banner";

export default function DashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [sessionActive, setSessionActive] = useState<boolean | null>(null);

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
      <OrgChart />
    </div>
  );
}
