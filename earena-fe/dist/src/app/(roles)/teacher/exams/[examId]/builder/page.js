"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExamBuilderPage;
const react_1 = require("react");
const ExamBuilderBoard_1 = require("@/features/exam-builder/components/ExamBuilderBoard");
const skeleton_1 = require("@/shared/components/ui/skeleton");
function ExamBuilderPage() {
    return (<div className="w-full">
      <react_1.Suspense fallback={<div className="max-w-5xl mx-auto space-y-4">
          <skeleton_1.Skeleton className="h-20 w-full rounded-xl"/>
          <skeleton_1.Skeleton className="h-[400px] w-full rounded-xl"/>
        </div>}>
        <ExamBuilderBoard_1.ExamBuilderBoard />
      </react_1.Suspense>
    </div>);
}
//# sourceMappingURL=page.js.map