'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TeacherMessagesPage;
const react_1 = require("react");
const MessagesScreen_1 = require("@/features/messaging/screens/MessagesScreen");
function TeacherMessagesPage() {
    return (<react_1.Suspense fallback={<div className="p-8 text-muted-foreground">Đang tải…</div>}>
      <MessagesScreen_1.MessagesScreen basePath="/teacher/messages"/>
    </react_1.Suspense>);
}
//# sourceMappingURL=page.js.map