"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { applyOwnerOptOutFromUrl, GA_MEASUREMENT_ID, isOwner, OWNER_OPT_OUT_KEY, pageview } from "@/lib/gtag";

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        id="ga-opt-out-check"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            try {
              if (new URLSearchParams(location.search).get('owner') === '1') {
                localStorage.setItem('${OWNER_OPT_OUT_KEY}', '1');
              }
              if (localStorage.getItem('${OWNER_OPT_OUT_KEY}') === '1') {
                window['ga-disable-${GA_MEASUREMENT_ID}'] = true;
              }
            } catch(e) {}
          `,
        }}
      />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
          `,
        }}
      />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    applyOwnerOptOutFromUrl();
    if (isOwner()) return;
    const query = searchParams.toString();
    pageview(`${pathname}${query ? `?${query}` : ""}`);
  }, [pathname, searchParams]);

  return null;
}
