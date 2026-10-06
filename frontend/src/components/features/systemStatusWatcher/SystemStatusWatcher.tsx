"use client";

import { useEffect, useState, type ReactNode } from "react";
import MaintenancePage from "@/components/elements/maintenancePage/MaintenancePage";
import { POLLING_INTERVAL } from "@/lib/data/data";

export default function SystemStatusWatcher({
  initialStatus,
  children,
}: {
  initialStatus: string;
  children: ReactNode;
}) {
  const [showMaintenance, setShowMaintenance] = useState(
    initialStatus === "Stop",
  );

  useEffect(() => {
    const controller = new AbortController();
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/system-status", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const { status } = await response.json();
        if (status === "Running" || status === "Stop") {
          setShowMaintenance(status === "Stop");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch system status:", error);
        }
      }
    }, POLLING_INTERVAL);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return showMaintenance ? <MaintenancePage /> : children;
}
