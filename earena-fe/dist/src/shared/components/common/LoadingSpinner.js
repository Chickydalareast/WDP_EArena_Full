"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingSpinner = void 0;
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
const LoadingSpinner = ({ size = 'md', className, fullScreen = false }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };
    const spinner = (<lucide_react_1.Loader2 className={(0, utils_1.cn)("animate-spin text-primary", sizeClasses[size], className)} aria-label="Đang xử lý dữ liệu..." role="status"/>);
    if (fullScreen) {
        return (<div className="fixed inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
        {spinner}
      </div>);
    }
    return <div className="flex justify-center items-center p-4">{spinner}</div>;
};
exports.LoadingSpinner = LoadingSpinner;
//# sourceMappingURL=LoadingSpinner.js.map