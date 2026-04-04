'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentPromoBanner = StudentPromoBanner;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
function StudentPromoBanner({ className }) {
    return (<div className={(0, utils_1.cn)("relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8 flex flex-col justify-center shadow-sm group min-h-[220px]", className)}>
            
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700 pointer-events-none"/>

            <div className="relative z-10 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shrink-0 shadow-lg shadow-primary/10">
                        <lucide_react_1.Bolt className="w-6 h-6"/>
                    </div>
                    
                    <div className="bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                        <lucide_react_1.Hourglass className="w-3.5 h-3.5"/> Chức năng sắp ra mắt
                    </div>
                </div>

                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Thi thử bứt phá điểm số</h2>
                <p className="text-slate-400 text-sm mb-6 font-medium max-w-sm">
                    Hệ thống phân tích năng lực bằng AI đang được hoàn thiện, hứa hẹn mang lại trải nghiệm luyện đề tối ưu.
                </p>

                
                <div className="inline-flex items-center justify-center bg-slate-700 text-slate-400 font-bold px-6 py-3 rounded-xl shadow-lg w-max cursor-not-allowed text-sm">
                    Chưa khả dụng
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=StudentPromoBanner.js.map