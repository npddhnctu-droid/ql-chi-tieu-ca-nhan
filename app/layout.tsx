import type { Metadata } from "next";
<<<<<<< HEAD
=======
import { initMonitoring } from "@/src/lib/monitoring";
>>>>>>> bde41d42dbe66e5037615b118626098e78297179
import { Geist, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { cn } from "@/lib/utils";
import MonitoringInit from "@/components/MonitoringInit";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

<<<<<<< HEAD
if (typeof window !== "undefined" && !(window as any).chrome) {
  (window as any).chrome = {
    runtime: {
      sendMessage: () => {},
      onMessage: { addListener: () => {} },
      lastError: null,
    },
  };
=======
// Initialize monitoring on client side
if (typeof window !== "undefined") {
  initMonitoring();
>>>>>>> bde41d42dbe66e5037615b118626098e78297179
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
<<<<<<< HEAD
}) {
=======
}>) {
>>>>>>> bde41d42dbe66e5037615b118626098e78297179
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MonitoringInit />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
