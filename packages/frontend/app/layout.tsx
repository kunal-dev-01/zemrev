import type { Metadata } from "next";
import { Inter } from "next/font/google";
import MainProvider from "@/lib/Provider/Provider";
import "./globals.css";

const inter = Inter({
  subsets:["latin"],
  variable: "--font-inter",
  display: "swap",
})


export const metadata: Metadata = {
  title: "Zemrev - Free Image Tools | Convert, Compress, Resize & Optimize",
  description:
    "Zemrev is a fast, privacy-focused platform offering free tools to convert, compress, resize, crop, optimize, watermark and edit images. No login, no limits — just upload, process, and download instantly.",
  keywords: [
    "Zemrev",
    "image tools",
    "image converter",
    "image compressor",
    "image resizer",
    "image optimizer",
    "image cropper",
    "watermark tool",
    "free image tools",
    "online image editor",
    "fast image processing",
    "no login tools",
    "privacy focused image tools",
  ],

  openGraph: {
    title: "Zemrev - Fast & Free Image Tools",
    description:
      "Convert, compress, resize, crop, optimize and watermark images instantly. 100% free, no signup and privacy-first.",
    url: "https://www.zemrev.com",
    siteName: "Zemrev",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zemrev - Free Image Tools",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Zemrev - Free Image Tools",
    description:
      "Fast image converter, compressor, resizer, optimizer, cropper and watermark tools — no login required.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
        cz-shortcut-listen="true"
      >
        <MainProvider>{children}</MainProvider>
      </body>
    </html>
  );
}
