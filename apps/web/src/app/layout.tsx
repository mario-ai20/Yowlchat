import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import { DEFAULT_APP_LOCALE } from "@yowl/types";
import { ThemeBootstrap } from "../components/theme-bootstrap";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "YowlChat",
  description: "Premium camera-first social app with original Yowl branding.",
  icons: {
    icon: [
      { url: "/brand/favicon.ico", type: "image/x-icon" },
      { url: "/brand/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/brand/icon-512.png", type: "image/png", sizes: "512x512" }
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: ["/brand/favicon.ico"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={DEFAULT_APP_LOCALE} className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body className="noise antialiased">
        <ThemeBootstrap />
        {children}
      </body>
    </html>
  );
}
