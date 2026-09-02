import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@/components/google-analytics";
import { MicrosoftClarity } from "@/components/microsoft-clarity";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://metricfinance.app"),
  applicationName: "Metric Finance",
  title: "Stocks Explained in Plain English | Metric Finance",
  description:
    "Choose the US stocks you follow and get a free daily briefing covering price action, fundamentals, peers, and the news that matters.",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Stocks Explained in Plain English | Metric Finance",
    description:
      "Choose the US stocks you follow and get a free daily briefing covering price action, fundamentals, peers, and the news that matters.",
    url: "https://metricfinance.app",
    siteName: "Metric Finance",
    images: [{ url: "https://metricfinance.app/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stocks Explained in Plain English | Metric Finance",
    description:
      "Choose the US stocks you follow and get a free daily briefing covering price action, fundamentals, peers, and the news that matters.",
    images: ["https://metricfinance.app/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <GoogleAnalytics />
        <MicrosoftClarity />
        <Analytics />
      </body>
    </html>
  );
}
