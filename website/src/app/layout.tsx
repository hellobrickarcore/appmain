import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HelloBrick - #1 LEGO® & Collectible AR Scanner & Portfolio Tracker",
    template: "%s | HelloBrick",
  },
  description:
    "Point your camera for live AR floating market prices on LEGO sets, rare minifigures, and collectible cards. Track portfolio values, sealed vs. used prices, retirement alerts, and AI build recipes for loose bricks.",
  keywords: [
    "LEGO scanner",
    "LEGO collection tracker",
    "AR price scanner",
    "LEGO portfolio tracker",
    "Brickify alternative",
    "BrickLink market value",
    "LEGO minifigure identifier",
    "what can I build with my LEGO",
    "LEGO investment",
    "LEGO retirement alerts",
  ],
  authors: [{ name: "HelloBrick" }],
  creator: "HelloBrick",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "HelloBrick",
    title: "HelloBrick | #1 LEGO® & Collectible AR Scanner & Value Tracker",
    description:
      "Point your camera to see live floating market values over sets, minifigures, and cards. Track your collection like a stock portfolio.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HelloBrick | #1 LEGO® & Collectible AR Scanner & Value Tracker",
    description:
      "Instant AR price detection, portfolio net worth tracking, retirement alerts, and AI build ideas for LEGO collectors.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050A18",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17962579312"
          strategy="afterInteractive"
        />
        <Script id="google-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-17962579312');
          `}
        </Script>
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh bg-white text-gray-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
