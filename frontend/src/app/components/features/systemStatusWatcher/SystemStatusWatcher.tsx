"use client";

import { useEffect, useState } from "react";
import { getSystemStatus } from "@/app/helper/api/maintenanceApi";
import MaintenancePage from "@/app/components/elements/maintenancePage/MaintenancePage";
import { POLLING_INTERVAL } from "@/app/helper/data/data";

export default function SystemStatusWatcher() {
  const [showMaintenance, setShowMaintenance] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await getSystemStatus();
      if (status === "Stop") setShowMaintenance(true);
    };

    if (!showMaintenance) {
      const interval = setInterval(checkStatus, POLLING_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [showMaintenance]);

  return showMaintenance ? <MaintenancePage /> : null;
}
