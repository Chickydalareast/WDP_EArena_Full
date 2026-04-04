import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import AuthProvider from "@/shared/providers/AuthProvider";
import { Toaster } from "@/shared/components/ui/sonner";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { TransactionConfirmModal } from '@/features/billing/components/TransactionConfirmModal';
import { CommunityFloatingChatShell } from '@/features/community/components/CommunityFloatingChatShell';

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "EArena - Online Exam Platform",
  description: "Hệ thống thi trực tuyến chịu tải cao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${outfit.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <QueryProvider>
            <AuthProvider>
              <CommunityFloatingChatShell>{children}</CommunityFloatingChatShell>
            </AuthProvider>
            <Toaster 
              position="top-right" 
              style={{ top: 'calc(64px + 1rem)' }} 
            />
            <TransactionConfirmModal />
          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}