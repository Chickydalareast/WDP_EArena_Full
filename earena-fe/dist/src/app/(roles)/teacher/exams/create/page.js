"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CreateExamPage;
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const InitExamForm_1 = require("@/features/exam-builder/components/InitExamForm");
const GenerateExamForm_1 = require("@/features/exam-builder/components/GenerateExamForm");
const tabs_1 = require("@/shared/components/ui/tabs");
function CreateExamPage() {
    return (<div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Tạo Đề Thi Mới
          </h1>
        </div>
        <link_1.default href="/teacher/exams" className="flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 hover:bg-blue-50 px-4 py-2 rounded-lg">
          <lucide_react_1.ChevronLeft className="w-4 h-4 mr-1"/>
          Hủy & Quay lại
        </link_1.default>
      </div>

      
      <tabs_1.Tabs defaultValue="manual" className="w-full">
        <tabs_1.TabsList className="grid w-full grid-cols-2 max-w-md mb-8 h-12">
          <tabs_1.TabsTrigger value="manual" className="text-base font-semibold">
            <lucide_react_1.PenTool className="w-4 h-4 mr-2"/> Tạo Thủ Công
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="auto" className="text-base font-semibold">
            <lucide_react_1.Bot className="w-4 h-4 mr-2"/> Gen Ma Trận (Auto)
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        
        <tabs_1.TabsContent value="manual" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <div className="mb-6 text-slate-500 text-sm text-center">
            Tạo khung vỏ đề trước, sau đó bạn sẽ tự do kéo thả, import hoặc thêm câu hỏi vào không gian soạn thảo.
          </div>
          <InitExamForm_1.InitExamForm />
        </tabs_1.TabsContent>

        
        <tabs_1.TabsContent value="auto" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
           <div className="mb-6 text-slate-500 text-sm text-center">
            Hệ thống sẽ tự động trộn và bốc câu hỏi từ Ngân hàng dựa trên Ma trận bạn cung cấp.
          </div>
          <GenerateExamForm_1.GenerateExamForm />
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
//# sourceMappingURL=page.js.map