import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HelloBrick - LEGO Collection Tracker",
    template: "%s | HelloBrick",
  },
  description:
    "HelloBrick helps LEGO fans scan bricks, organise collections, manage inventories and discover new ways to build. The modern alternative for serious LEGO collectors.",
  keywords: [
    "LEGO scanner",
    "LEGO inventory app",
    "organise LEGO collection",
    "track LEGO inventory",
    "identify LEGO pieces",
    "LEGO collection tracker",
    "what to build with my LEGO",
    "manage LEGO sets",
  ],
  authors: [{ name: "HelloBrick" }],
  creator: "HelloBrick",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "HelloBrick",
    title: "HelloBrick | The Complete LEGO Collection App",
    description:
      "HelloBrick helps LEGO fans scan bricks, organise collections, manage inventories and discover new ways to build.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HelloBrick | The Complete LEGO Collection App",
    description:
      "Scan your LEGO collection, identify bricks, organise sets, discover new builds and manage everything in one place.",
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
  themeColor: "#0C0F14",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh bg-hb-bg text-hb-primary font-inter antialiased">
        {children}
      </body>
    </html>
  );
}
