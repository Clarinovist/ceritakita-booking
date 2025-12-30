import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CeritaKita Studio - Booking Sesi Foto",
  description: "Booking sesi foto profesional bersama CeritaKita Studio. Pilih layanan, tentukan jadwal, dan abadikan momen terbaik Anda.",
  applicationName: "CeritaKita Studio",
  authors: [{ name: "CeritaKita Studio" }],
  keywords: ["foto", "photography", "booking", "sesi foto", "CeritaKita", "studio"],
  creator: "CeritaKita Studio",
  publisher: "CeritaKita Studio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ceritakita-studio.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CeritaKita Studio - Booking Sesi Foto",
    description: "Booking sesi foto profesional bersama CeritaKita Studio. Pilih layanan, tentukan jadwal, dan abadikan momen terbaik Anda.",
    type: "website",
    locale: "id_ID",
    siteName: "CeritaKita Studio",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "CeritaKita Studio - Booking Sesi Foto",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CeritaKita Studio - Booking Sesi Foto",
    description: "Booking sesi foto profesional bersama CeritaKita Studio",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#2563eb",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
