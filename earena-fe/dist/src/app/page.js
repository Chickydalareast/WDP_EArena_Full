"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LandingPage;
const SmartNavbarWrapper_1 = __importDefault(require("@/shared/components/layout/SmartNavbarWrapper"));
const PublicFooter_1 = __importDefault(require("@/shared/components/layout/PublicFooter"));
const HeroSection_1 = __importDefault(require("@/features/landing/components/HeroSection"));
const FeaturedClasses_1 = __importDefault(require("@/features/landing/components/FeaturedClasses"));
const CommunitySection_1 = __importDefault(require("@/features/landing/components/CommunitySection"));
const AnalyticsSection_1 = __importDefault(require("@/features/landing/components/AnalyticsSection"));
const ManagementTools_1 = __importDefault(require("@/features/landing/components/ManagementTools"));
function LandingPage() {
    return (<div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      
  
      <SmartNavbarWrapper_1.default />
      
      <main className="flex-1 w-full overflow-hidden">
        <HeroSection_1.default />
        <FeaturedClasses_1.default />
        <CommunitySection_1.default />
        <AnalyticsSection_1.default />
        <ManagementTools_1.default />
      </main>

      <PublicFooter_1.default />
    </div>);
}
//# sourceMappingURL=page.js.map