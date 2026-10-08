import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@/components/google-analytics";
import { VercelAnalytics } from "@/components/vercel-analytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://metricfinance.app"),
  applicationName: "Metric Finance",
  title: "Metric Finance | Stocks explained like you're 5",
  description:
    "A free daily brief for beginners that explains up to five US stocks like you're 5, shows why each moved at 5 PM ET and answers your follow up questions.",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Metric Finance | Stocks explained like you're 5",
    description:
      "A free daily brief for beginners that explains up to five US stocks like you're 5, shows why each moved at 5 PM ET and answers your follow up questions.",
    url: "https://metricfinance.app",
    siteName: "Metric Finance",
    images: [{ url: "https://metricfinance.app/og-image-v2.jpg", width: 1200, height: 630, alt: "Metric Finance: stocks explained like you're 5", type: "image/jpeg" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Metric Finance | Stocks explained like you're 5",
    description:
      "A free daily brief for beginners that explains up to five US stocks like you're 5, shows why each moved at 5 PM ET and answers your follow up questions.",
    images: ["https://metricfinance.app/og-image-v2.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.png?v=2", sizes: "any", type: "image/png" },
      { url: "/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=2", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" },
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
        <VercelAnalytics />
      </body>
    </html>
  );
}
