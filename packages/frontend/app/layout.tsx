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
  title: "Zemrev.",
  description: "",
  icons: {
    icon: "/favicon.ico",
  }
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
