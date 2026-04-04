"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = TeacherQuestionBankPage;
const QuestionBankScreen_1 = require("@/features/question-bank/screens/QuestionBankScreen");
exports.metadata = {
    title: 'Ngân hàng Câu hỏi | EArena Teacher',
    description: 'Quản lý kho câu hỏi và thư mục tài nguyên dành cho Giáo viên.',
};
async function TeacherQuestionBankPage() {
    return (<main className="w-full h-full">
      <QuestionBankScreen_1.QuestionBankScreen />
    </main>);
}
//# sourceMappingURL=page.js.map