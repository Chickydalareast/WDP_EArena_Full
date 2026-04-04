"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthLayout;
const react_1 = require("react");
function AuthLayout({ children }) {
    return (<react_1.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
          Đang tải...
        </div>}>
      {children}
    </react_1.Suspense>);
}
//# sourceMappingURL=layout.js.map