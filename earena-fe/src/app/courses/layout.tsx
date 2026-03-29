import SmartNavbarWrapper from "@/shared/components/layout/SmartNavbarWrapper";
import PublicFooter from "@/shared/components/layout/PublicFooter";
import { ReactNode } from "react";

export default function CoursesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      <SmartNavbarWrapper />
      
      <main className="flex-1 w-full pt-16">
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}