'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollButton = EnrollButton;
const react_1 = __importDefault(require("react"));
const navigation_1 = require("next/navigation");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const useBillingFlows_1 = require("../hooks/useBillingFlows");
const routes_1 = require("@/config/routes");
const utils_1 = require("@/shared/lib/utils");
function EnrollButton({ course, className, variant = 'default', size = 'lg' }) {
    const router = (0, navigation_1.useRouter)();
    const { handleCheckout, isProcessing } = (0, useBillingFlows_1.useCheckoutFlow)();
    if (course.isEnrolled) {
        return (<button_1.Button onClick={() => router.push(routes_1.ROUTES.STUDENT.STUDY_ROOM(course.id))} className={(0, utils_1.cn)("bg-emerald-600 hover:bg-emerald-700 text-white font-bold", className)} size={size}>
        <lucide_react_1.PlayCircle className="w-5 h-5 mr-2"/> Vào phòng học
      </button_1.Button>);
    }
    const finalPrice = course.discountPrice ?? course.price;
    const isFree = finalPrice === 0;
    return (<button_1.Button onClick={() => handleCheckout(course)} disabled={isProcessing} variant={variant} size={size} className={(0, utils_1.cn)("font-bold shadow-md transition-all active:scale-95", className)}>
      {isProcessing ? (<>
          <lucide_react_1.Loader2 className="mr-2 h-5 w-5 animate-spin"/>
          Đang xử lý giao dịch...
        </>) : (<>
          <lucide_react_1.ShoppingCart className="w-5 h-5 mr-2"/> 
          {isFree ? 'Đăng ký Miễn phí' : `Mua ngay - ${finalPrice.toLocaleString()}đ`}
        </>)}
    </button_1.Button>);
}
//# sourceMappingURL=EnrollButton.js.map