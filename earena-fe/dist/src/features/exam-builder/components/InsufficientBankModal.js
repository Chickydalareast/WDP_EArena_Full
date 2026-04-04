'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsufficientBankModal = InsufficientBankModal;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const matrix_error_store_1 = require("@/features/exam-taking/stores/matrix-error.store");
function InsufficientBankModal() {
    const { isOpen, errorMessage, closeError } = (0, matrix_error_store_1.useMatrixErrorStore)();
    return (<dialog_1.Dialog open={isOpen} onOpenChange={closeError}>
            <dialog_1.DialogContent className="sm:max-w-md border-red-200 bg-white">
                <dialog_1.DialogHeader className="flex flex-col items-center text-center sm:text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <lucide_react_1.AlertTriangle className="w-8 h-8"/>
                    </div>
                    <dialog_1.DialogTitle className="text-xl font-bold text-slate-800">
                        Sinh đề thất bại
                    </dialog_1.DialogTitle>
                    <dialog_1.DialogDescription className="text-base text-slate-600 mt-2 font-medium">
                        {errorMessage || 'Ngân hàng không đủ dữ liệu. Vui lòng kiểm tra lại số lượng hoặc cấu hình ma trận.'}
                    </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mt-2 text-sm text-amber-800">
                    <strong>Gợi ý:</strong> Bạn cần bổ sung thêm câu hỏi vào Ngân hàng, hoặc giảm chỉ tiêu số lượng (Limit) trong cấu trúc Form vừa tạo.
                </div>

                <dialog_1.DialogFooter className="sm:justify-center mt-4">
                    <button_1.Button type="button" variant="default" onClick={closeError} className="bg-red-600 hover:bg-red-700 text-white px-8">
                        Đã hiểu
                    </button_1.Button>
                </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=InsufficientBankModal.js.map