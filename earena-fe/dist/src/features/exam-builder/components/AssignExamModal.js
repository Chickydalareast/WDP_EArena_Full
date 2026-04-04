'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignExamModal = AssignExamModal;
const react_1 = __importDefault(require("react"));
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
function AssignExamModal({ isOpen, onClose }) {
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onClose}>
      <dialog_1.DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-border rounded-xl">
        <div className="bg-muted/30 p-6 border-b border-border">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle className="text-xl font-bold flex items-center gap-2">
              <lucide_react_1.CalendarClock className="w-5 h-5 text-primary"/>
              Giao Bài Tập / Đề Thi
            </dialog_1.DialogTitle>
            <dialog_1.DialogDescription className="text-muted-foreground mt-1">
              Thông báo cập nhật hệ thống
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
        </div>

        <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
            <lucide_react_1.Wrench size={32}/>
          </div>
          <h3 className="font-bold text-lg text-foreground">Tính năng đang bảo trì</h3>
          <p className="text-sm text-muted-foreground">
            Luồng giao bài đang được cấu trúc lại để tích hợp hoàn toàn vào hệ thống <strong>Khóa Học (Course)</strong>. Bạn sẽ sớm có thể giao bài trực tiếp trong từng khóa học!
          </p>
        </div>

        <div className="p-4 border-t border-border flex justify-end bg-muted/10">
          <button_1.Button onClick={onClose} className="font-bold">
            Đã hiểu
          </button_1.Button>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
//# sourceMappingURL=AssignExamModal.js.map