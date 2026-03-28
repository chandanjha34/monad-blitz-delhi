import type { Metadata } from "next";
import { Baloo_2, Fredoka } from "next/font/google";
import { ActivityTicker } from "@/components/ActivityTicker";
import { NavBar } from "@/components/NavBar";
import { Providers } from "@/components/Providers";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const display = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Fredoka({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Proof Go — Scan, Discover & Collect on Monad",
  description: "Identity minting and social collecting with Monad speed. Powered by Monad testnet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="app-bg min-h-full">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <ActivityTicker />
            <NavBar />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
