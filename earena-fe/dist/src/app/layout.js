"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const google_1 = require("next/font/google");
require("./globals.css");
const QueryProvider_1 = require("@/shared/providers/QueryProvider");
const AuthProvider_1 = __importDefault(require("@/shared/providers/AuthProvider"));
const sonner_1 = require("@/shared/components/ui/sonner");
const google_2 = require("@react-oauth/google");
const TransactionConfirmModal_1 = require("@/features/billing/components/TransactionConfirmModal");
const outfit = (0, google_1.Outfit)({
    subsets: ["latin"],
    variable: "--font-sans",
});
exports.metadata = {
    title: "EArena - Online Exam Platform",
    description: "Hệ thống thi trực tuyến chịu tải cao",
};
function RootLayout({ children, }) {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    return (<html lang="vi" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className={`${outfit.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <google_2.GoogleOAuthProvider clientId={googleClientId}>
          <QueryProvider_1.QueryProvider>
            <AuthProvider_1.default>
              {children}
            </AuthProvider_1.default>
            <sonner_1.Toaster position="top-right" style={{ top: 'calc(64px + 1rem)' }}/>
            <TransactionConfirmModal_1.TransactionConfirmModal />
          </QueryProvider_1.QueryProvider>
        </google_2.GoogleOAuthProvider>
      </body>
    </html>);
}
//# sourceMappingURL=layout.js.map