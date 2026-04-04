'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBankQuestionSheet = CreateBankQuestionSheet;
const react_1 = __importDefault(require("react"));
const sheet_1 = require("@/shared/components/ui/sheet");
const BulkManualQuestionForm_1 = require("@/features/exam-builder/components/BulkManualQuestionForm");
const useBankMutations_1 = require("../hooks/useBankMutations");
const question_bank_store_1 = require("../stores/question-bank.store");
const sonner_1 = require("sonner");
function CreateBankQuestionSheet({ isOpen, onClose }) {
    const selectedFolderId = (0, question_bank_store_1.useQuestionBankStore)(state => state.selectedFolderId);
    const { mutate: createQuestions, isPending } = (0, useBankMutations_1.useCreateBankQuestions)();
    const handleSave = (questionsData) => {
        if (!selectedFolderId) {
            sonner_1.toast.error('Lỗi', { description: 'Chưa chọn thư mục đích.' });
            return;
        }
        createQuestions({ folderId: selectedFolderId, questionsData }, { onSuccess: () => onClose() });
    };
    return (<sheet_1.Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <sheet_1.SheetContent side="right" className="w-full sm:max-w-[850px] overflow-y-auto bg-slate-50 sm:rounded-l-2xl p-0 border-none shadow-2xl">
                <sheet_1.SheetHeader className="p-6 bg-white border-b sticky top-0 z-30 shadow-sm">
                    <sheet_1.SheetTitle className="text-2xl font-black text-slate-800">Tạo câu hỏi mới</sheet_1.SheetTitle>
                    <sheet_1.SheetDescription className="text-sm">
                        Soạn câu hỏi trắc nghiệm đơn hoặc khối bài đọc lồng nhau. Dữ liệu sẽ được lưu thẳng vào kho.
                    </sheet_1.SheetDescription>
                </sheet_1.SheetHeader>

                <div className="p-4 sm:p-6 pb-24">
                    <BulkManualQuestionForm_1.BulkManualQuestionForm onSave={handleSave} isPending={isPending} onCancel={onClose}/>
                </div>
            </sheet_1.SheetContent>
        </sheet_1.Sheet>);
}
//# sourceMappingURL=CreateBankQuestionSheet.js.map