import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import AuthProvider from "@/shared/providers/AuthProvider"; // 1. BẮT BUỘC IMPORT AUTH PROVIDER
import { Toaster } from "@/shared/components/ui/sonner"; 

export const metadata: Metadata = {
  title: "EArena - Online Exam Platform",
  description: "Hệ thống thi trực tuyến chịu tải cao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>

          <Toaster position="top-right" richColors /> 
        </QueryProvider>
      </body>
    </html>
  );
}