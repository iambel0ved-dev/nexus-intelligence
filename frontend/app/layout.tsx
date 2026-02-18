import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  title: "Nexus Intel | AI Infrastructure Surveillance",
  description: "Autonomous market intelligence for the 2026 token economy. Built by Abeeb Beloved Salam.",
  openGraph: {
    title: "Nexus Intelligence Oracle",
    description: "Live tracking and AI analysis of global provider pricing.",
    url: "https://nexus-intelligence-six.vercel.app/",
    siteName: "Nexus Intel",
    images: [
      {
        url: "/og-image.png", // You can add a screenshot of your dashboard here later
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexus Intel",
    description: "Autonomous AI Infrastructure Surveillance.",
    creator: "@iambel0ved",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
