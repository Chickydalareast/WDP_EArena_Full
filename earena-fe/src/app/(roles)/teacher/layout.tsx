import React from "react";
import { AppNavbar } from "@/shared/components/layout/AppNavbar";
import { StudentFooter as AppFooter } from "@/shared/components/layout/StudentFooter"; 

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col transition-colors duration-200">
      <AppNavbar />
      
      <main className="flex-1 pt-24 pb-12 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <AppFooter />
    </div>
  );
}