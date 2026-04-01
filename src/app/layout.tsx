import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Suspense } from "react";
import { ReferralTracker } from "@/components/ReferralTracker";
import { AuthProvider } from "@/context/AuthContext";
import { ChatAssistant } from "@/components/ai/ChatAssistant";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "FICO Geek - Smart Credit Dispute Tools",
  description: "Secure self-help credit dispute and document workspace for everyday users and professionals.",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-inter antialiased bg-base-light text-primary-navy`}>
        <AuthProvider>
          <ErrorBoundary>
            <Suspense fallback={null}>
              <ReferralTracker />
            </Suspense>
          </ErrorBoundary>
          {children}
          <ErrorBoundary>
            <ChatAssistant />
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
