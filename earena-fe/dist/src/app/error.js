'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GlobalError;
const react_1 = require("react");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
function GlobalError({ error, reset, }) {
    (0, react_1.useEffect)(() => {
        console.error('[Global Route Error]', error);
    }, [error]);
    return (<div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <lucide_react_1.AlertTriangle className="h-16 w-16 text-destructive mb-4"/>
      <h2 className="text-3xl font-bold tracking-tight mb-3">Lỗi Hệ Thống Nghiêm Trọng</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        EArena đang gặp sự cố khi tải trang này. Chúng tôi đã ghi nhận lỗi. Vui lòng tải lại hoặc quay về trang chủ.
      </p>
      <div className="flex gap-4">
        <button_1.Button onClick={() => reset()} size="lg">
          Tải lại trang
        </button_1.Button>
        <button_1.Button variant="secondary" onClick={() => window.location.href = '/'} size="lg">
          Về trang chủ
        </button_1.Button>
      </div>
    </div>);
}
//# sourceMappingURL=error.js.map