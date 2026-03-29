// src/app/page.tsx
import SmartNavbarWrapper from "@/shared/components/layout/SmartNavbarWrapper";
import PublicFooter from "@/shared/components/layout/PublicFooter";
import HeroSection from "@/features/landing/components/HeroSection";
import FeaturedClasses from "@/features/landing/components/FeaturedClasses";
import CommunitySection from "@/features/landing/components/CommunitySection";
import AnalyticsSection from "@/features/landing/components/AnalyticsSection";
import ManagementTools from "@/features/landing/components/ManagementTools";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      
  
      <SmartNavbarWrapper />
      
      <main className="flex-1 w-full overflow-hidden">
        <HeroSection />
        <FeaturedClasses />
        <CommunitySection />
        <AnalyticsSection />
        <ManagementTools />
      </main>

      <PublicFooter />
    </div>
  );
}