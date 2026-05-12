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
  description: "Premium camera-first social app with original Yowl branding."
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
