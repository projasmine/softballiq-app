import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Softball IQ",
  description:
    "Master softball game IQ with daily quizzes, team assignments, and progress tracking. 8U–14U. Built for girls' softball.",
  metadataBase: new URL("https://softballiq.app"),
  openGraph: {
    title: "Softball IQ",
    description: "Master softball game IQ with daily quizzes and team assignments. 8U–14U.",
    url: "https://softballiq.app",
    siteName: "Softball IQ",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Softball IQ",
    description: "Master softball game IQ with daily quizzes and team assignments. 8U–14U.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23c9a227'/><text x='50' y='58' font-family='system-ui' font-size='42' font-weight='700' fill='%23191a20' text-anchor='middle' dominant-baseline='middle'>SIQ</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
