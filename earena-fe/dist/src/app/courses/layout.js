"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CoursesLayout;
const SmartNavbarWrapper_1 = __importDefault(require("@/shared/components/layout/SmartNavbarWrapper"));
const PublicFooter_1 = __importDefault(require("@/shared/components/layout/PublicFooter"));
function CoursesLayout({ children, }) {
    return (<div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      <SmartNavbarWrapper_1.default />
      
      <main className="flex-1 w-full pt-16">
        {children}
      </main>

      <PublicFooter_1.default />
    </div>);
}
//# sourceMappingURL=layout.js.map