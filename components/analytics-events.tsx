"use client";

import { useEffect } from "react";
import { trackProductEvent } from "@/lib/product-events";

export function LandingViewEvent() {
  useEffect(() => {
    trackProductEvent({ eventName: "landing_view" });
  }, []);

  return null;
}
