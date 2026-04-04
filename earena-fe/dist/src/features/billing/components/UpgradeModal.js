'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpgradeModal = UpgradeModal;
const react_1 = __importDefault(require("react"));
const navigation_1 = require("next/navigation");
const upgrade_ui_store_1 = require("../stores/upgrade-ui.store");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
function UpgradeModal() {
    const router = (0, navigation_1.useRouter)();
    const { isOpen, message, closeModal } = (0, upgrade_ui_store_1.useUpgradeUIStore)();
    const handleUpgradeClick = () => {
        closeModal();
        router.push('/pricing');
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={closeModal}>
            <dialog_1.DialogContent className="sm:max-w-md text-center">
                <dialog_1.DialogHeader className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                        <lucide_react_1.Crown className="w-8 h-8 text-yellow-600"/>
                    </div>
                    <dialog_1.DialogTitle className="text-2xl font-bold">Nâng Cấp Gói Cước</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription className="text-base text-muted-foreground">
                        {message}
                    </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 my-4 text-left">
                    <h4 className="font-semibold text-yellow-800 flex items-center gap-2 mb-2">
                        <lucide_react_1.Sparkles className="w-4 h-4"/> Đặc quyền gói PRO/ENTERPRISE
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1.5 list-disc list-inside">
                        <li>Bán khóa học có thu phí (Premium Courses).</li>
                        <li>Không giới hạn số lượng khóa học xuất bản.</li>
                        <li>Được hỗ trợ Marketing từ nền tảng.</li>
                    </ul>
                </div>

                <dialog_1.DialogFooter className="flex-col sm:flex-row gap-2">
                    <button_1.Button variant="outline" className="w-full sm:w-auto" onClick={closeModal}>
                        Để sau
                    </button_1.Button>
                    <button_1.Button className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold border-0 shadow-md transition-transform active:scale-95" onClick={handleUpgradeClick}>
                        Nâng cấp ngay
                    </button_1.Button>
                </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=UpgradeModal.js.map