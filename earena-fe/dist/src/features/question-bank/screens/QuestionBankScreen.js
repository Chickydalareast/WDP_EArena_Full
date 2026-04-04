"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionBankScreen = QuestionBankScreen;
const react_1 = __importDefault(require("react"));
const FolderSidebar_1 = require("../components/FolderSidebar");
const QuestionList_1 = require("../components/QuestionList");
const ErrorBoundary_1 = require("@/shared/components/common/ErrorBoundary");
function QuestionBankScreen() {
    return (<div className="h-[calc(100vh-4rem)] w-full flex flex-col md:flex-row bg-white overflow-hidden border-t border-slate-200">

            
            <div className="w-full md:w-1/4 lg:w-1/5 min-w-[280px] border-r border-slate-200 h-full shrink-0 relative bg-slate-50/50">
                <ErrorBoundary_1.ErrorBoundary fallback={<div className="p-6 text-center text-red-500 bg-red-50 h-full flex items-center justify-center">
                        <div>
                            <p className="font-bold">Lỗi Cột Trái</p>
                            <p className="text-sm mt-2">Không thể tải cây thư mục.</p>
                        </div>
                    </div>}>
                    <FolderSidebar_1.FolderSidebar />
                </ErrorBoundary_1.ErrorBoundary>
            </div>

            
            <div className="flex-1 h-full w-full bg-slate-50 relative overflow-hidden">
                <ErrorBoundary_1.ErrorBoundary fallback={<div className="p-6 text-center text-red-500 bg-red-50 h-full flex items-center justify-center">
                        <div>
                            <p className="font-bold">Lỗi Cột Phải</p>
                            <p className="text-sm mt-2">Không thể tải danh sách câu hỏi.</p>
                        </div>
                    </div>}>
                    <QuestionList_1.QuestionList />
                </ErrorBoundary_1.ErrorBoundary>
            </div>

        </div>);
}
//# sourceMappingURL=QuestionBankScreen.js.map