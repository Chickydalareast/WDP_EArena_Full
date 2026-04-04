"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CommunityLayout;
const SmartNavbarWrapper_1 = __importDefault(require("@/shared/components/layout/SmartNavbarWrapper"));
const PublicFooter_1 = __importDefault(require("@/shared/components/layout/PublicFooter"));
const CommunityFloatingChatShell_1 = require("@/features/community/components/CommunityFloatingChatShell");
function CommunityLayout({ children }) {
    return (<div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      <SmartNavbarWrapper_1.default />
      <CommunityFloatingChatShell_1.CommunityFloatingChatShell>
        <main className="flex-1 w-full pt-16">{children}</main>
      </CommunityFloatingChatShell_1.CommunityFloatingChatShell>
      <PublicFooter_1.default />
    </div>);
}
//# sourceMappingURL=layout.js.map