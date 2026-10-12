"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { markOwner } from "@/lib/gtag";

// Rendered only for the owner's own accounts: signing in on any device stops that device being tracked.
export function OwnerMark() {
  useEffect(() => {
    markOwner();
    try {
      if (posthog.__loaded) posthog.opt_out_capturing();
    } catch {
      // Analytics never breaks the page.
    }
  }, []);
  return null;
}
