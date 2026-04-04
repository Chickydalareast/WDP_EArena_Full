'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitForReviewButton = SubmitForReviewButton;
const button_1 = require("@/shared/components/ui/button");
const useCurriculumMutations_1 = require("../../hooks/useCurriculumMutations");
const lucide_react_1 = require("lucide-react");
const course_schema_1 = require("../../types/course.schema");
function SubmitForReviewButton({ courseId, status = 'DRAFT' }) {
    const { mutate: submitForReview, isPending } = (0, useCurriculumMutations_1.useSubmitForReview)(courseId);
    if (status === course_schema_1.CourseStatus.PENDING_REVIEW || status === 'PENDING_REVIEW') {
        return (<button_1.Button disabled variant="outline" className="font-semibold border-yellow-400 text-yellow-600 bg-yellow-50">
                <lucide_react_1.Loader2 className="mr-2 w-4 h-4 animate-spin"/>
                Đang chờ duyệt
            </button_1.Button>);
    }
    if (status === course_schema_1.CourseStatus.PUBLISHED || status === 'PUBLISHED') {
        return (<button_1.Button disabled variant="outline" className="font-semibold border-green-400 text-green-600 bg-green-50">
                <lucide_react_1.CheckCircle2 className="mr-2 w-4 h-4"/>
                Đang On Air
            </button_1.Button>);
    }
    return (<button_1.Button onClick={() => submitForReview()} disabled={isPending} className="font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95">
            {isPending ? <lucide_react_1.Loader2 className="mr-2 w-4 h-4 animate-spin"/> : <lucide_react_1.Send className="mr-2 w-4 h-4"/>}
            Gửi yêu cầu kiểm duyệt
        </button_1.Button>);
}
//# sourceMappingURL=SubmitForReviewButton.js.map