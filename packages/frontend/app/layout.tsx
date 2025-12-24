import type { Metadata } from "next";
import localFont from "next/font/local";
import MainProvider from "@/lib/Provider/Provider";
import "./globals.css";
import Script from "next/script";

const inter = localFont({
  src: [
    {
      path: "./fonts/Inter-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Zemrev - Free Image & PDF Tools | Convert, Compress, Edit Online",
  description:
    "Zemrev is a fast, privacy-first platform offering free Image & PDF tools. Convert, compress, resize, optimize images and PDFs. No login, no limits — upload, process, and download instantly.",

  keywords: [
    // Brand
    "Zemrev",

    // Core platform
    "online tools",
    "free online tools",
    "privacy focused tools",
    "no login tools",

    // Image tools
    "image tools",
    "image converter",
    "image compressor",
    "image resizer",
    "image optimizer",
    "image cropper",
    "image watermark",

    // PDF tools
    "pdf tools",
    "pdf compressor",
    "pdf converter",
    "pdf merger",
    "pdf splitter",
    "pdf optimizer",
    "pdf ocr",
    "online pdf editor",
  ],

  openGraph: {
    title: "Zemrev - Fast & Free Image & PDF Tools",
    description:
      "Convert, compress, resize, optimize and edit Images & PDFs instantly. 100% free, no signup, privacy-first online tools.",
    url: "https://www.zemrev.com",
    siteName: "Zemrev",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zemrev - Free Image & PDF Tools",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Zemrev - Free Image & PDF Tools",
    description:
      "Fast online Image & PDF tools — convert, compress, optimize and edit files. No login required.",
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
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body { 
              margin: 0; 
              font-family: var(--font-inter); 
              -webkit-font-smoothing: antialiased;
            }
            * {
              box-sizing: border-box;
            }
          `,
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5Y3Z9KHCHV"
          strategy="lazyOnload"
        />

        <Script id="ga4" strategy="lazyOnload">
          {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-5Y3Z9KHCHV');
    `}
        </Script>
      </head>
      <body
        className={`${inter.variable} antialiased`}
        cz-shortcut-listen="true"
      >
        <MainProvider>{children}</MainProvider>
      </body>
    </html>
  );
}
