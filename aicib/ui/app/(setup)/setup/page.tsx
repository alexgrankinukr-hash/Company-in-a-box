"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SetupWizard } from "@/components/setup/setup-wizard";
import { Loader2 } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if setup is already done — redirect to dashboard if so
    fetch("/api/setup/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.configExists) {
          router.replace("/");
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        // If status check fails, show wizard anyway
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <SetupWizard />;
}
