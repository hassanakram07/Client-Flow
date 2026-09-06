import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NexOps — Enterprise Client Operations & Automation",
    template: "%s | NexOps",
  },
  description:
    "NexOps is an enterprise B2B client portal and automated workflow orchestration platform for agencies and professional service organizations.",
  keywords: ["client portal", "workflow automation", "B2B SaaS", "deliverable approvals", "agency management"],
  openGraph: {
    title: "NexOps — Enterprise Client Operations",
    description: "Multi-tenant B2B client portal with deliverable reviews, invoicing, and workflow automation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className={`${inter.variable} ${ibmPlexMono.variable} font-sans antialiased text-slate-900 bg-slate-50 min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
