"use client";

import { useEffect, useState } from "react";
import { getSystemStatus } from "@/lib/api/maintenanceApi";
import MaintenancePage from "@/components/elements/maintenancePage/MaintenancePage";
import { POLLING_INTERVAL } from "@/lib/data/data";

export default function SystemStatusWatcher() {
  const [showMaintenance, setShowMaintenance] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const status = await getSystemStatus();
        if (status === "Stop") {
          setShowMaintenance(true);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Failed to fetch system status:", error);
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return showMaintenance ? <MaintenancePage /> : null;
}
