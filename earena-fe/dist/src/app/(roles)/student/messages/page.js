'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StudentMessagesPage;
const react_1 = require("react");
const MessagesScreen_1 = require("@/features/messaging/screens/MessagesScreen");
function StudentMessagesPage() {
    return (<react_1.Suspense fallback={<div className="p-8 text-muted-foreground">Đang tải…</div>}>
      <MessagesScreen_1.MessagesScreen basePath="/student/messages"/>
    </react_1.Suspense>);
}
//# sourceMappingURL=page.js.map