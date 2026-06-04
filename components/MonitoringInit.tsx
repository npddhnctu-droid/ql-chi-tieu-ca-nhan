"use client";

import { useEffect } from "react";
import { initMonitoring } from "@/src/lib/monitoring";

export default function MonitoringInit() {
  useEffect(() => {
    initMonitoring();
  }, []);
  return null;
}
