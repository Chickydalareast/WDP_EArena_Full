'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyCoursesList = MyCoursesList;
const react_1 = __importStar(require("react"));
const useMyCourses_1 = require("../hooks/useMyCourses");
const MyCourseCard_1 = require("./MyCourseCard");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const routes_1 = require("@/config/routes");
const utils_1 = require("@/shared/lib/utils");
function MyCoursesList() {
    const [page, setPage] = (0, react_1.useState)(1);
    const { data, isLoading, isError } = (0, useMyCourses_1.useMyCourses)(page, 10);
    if (isLoading) {
        return (<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-fr">
                
                
                <div className="md:col-span-2 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 rounded-[2rem] border border-border/50 p-6 bg-card items-stretch">
                    <skeleton_1.Skeleton className="w-full md:w-5/12 aspect-video md:aspect-auto h-48 md:h-full rounded-2xl shrink-0"/>
                    <div className="flex-1 flex flex-col space-y-4 py-2 w-full">
                        <skeleton_1.Skeleton className="h-9 w-full rounded-xl"/>
                        <skeleton_1.Skeleton className="h-6 w-1/2 rounded-lg"/>
                        <div className="mt-auto space-y-3 pt-6">
                          <skeleton_1.Skeleton className="h-2.5 w-full rounded-full"/>
                          <skeleton_1.Skeleton className="h-6 w-24 rounded-md"/>
                        </div>
                    </div>
                </div>

                
                {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="flex flex-col rounded-[2rem] border border-border/50 p-5 bg-card">
                        <skeleton_1.Skeleton className="w-full h-48 rounded-2xl mb-4"/>
                        <div className="space-y-3 shrink-0 flex-1">
                            <skeleton_1.Skeleton className="h-7 w-full rounded-lg"/>
                            <skeleton_1.Skeleton className="h-5 w-2/3 rounded-md"/>
                        </div>
                        <div className="mt-auto space-y-3 pt-4">
                          <skeleton_1.Skeleton className="h-2.5 w-full rounded-full"/>
                        </div>
                    </div>))}
            </div>);
    }
    if (isError) {
        return (<div className="p-12 text-center text-destructive bg-destructive/5 rounded-3xl border border-destructive/20 font-medium">
                Không thể tải danh sách khóa học. Vui lòng thử lại sau.
            </div>);
    }
    const courses = data?.data || [];
    const meta = data?.meta;
    if (courses.length === 0) {
        return (<div className="bg-card rounded-[2.5rem] border border-border/50 p-16 text-center shadow-sm">
                <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <lucide_react_1.BookOpen className="w-12 h-12"/>
                </div>
                <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">Chưa có khóa học nào</h3>
                <p className="text-muted-foreground mb-10 max-w-lg mx-auto font-medium">
                    Bạn chưa ghi danh vào khóa học nào. Hãy khám phá kho tàng kiến thức trên E-Arena ngay hôm nay.
                </p>
                <link_1.default href={routes_1.ROUTES.PUBLIC.COURSES}>
                    <button_1.Button size="lg" className="font-bold h-14 px-8 rounded-full shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
                        Khám phá khóa học ngay
                    </button_1.Button>
                </link_1.default>
            </div>);
    }
    return (<div className="space-y-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-fr">
                {courses.map((enrollment, index) => {
            const isHero = index === 0;
            return (<div key={enrollment.id} className={(0, utils_1.cn)(isHero && "md:col-span-2")}>
                            <MyCourseCard_1.MyCourseCard enrollment={enrollment} isHero={isHero} className="h-full"/>
                        </div>);
        })}
            </div>

            
            {meta && meta.totalPages > 1 && (<div className="flex items-center justify-center gap-4 pt-10 border-t border-border/50">
                    <button_1.Button variant="outline" disabled={!meta.hasPrevPage} onClick={() => {
                setPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }} className="font-semibold rounded-full px-6 h-12">
                        <lucide_react_1.ChevronLeft className="w-4 h-4 mr-2"/> Trang trước
                    </button_1.Button>
                    <span className="text-sm font-bold bg-secondary px-4 py-2 rounded-full text-secondary-foreground">
                        {meta.page} / {meta.totalPages}
                    </span>
                    <button_1.Button variant="outline" disabled={!meta.hasNextPage} onClick={() => {
                setPage(p => p + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }} className="font-semibold rounded-full px-6 h-12">
                        Trang tiếp <lucide_react_1.ChevronRight className="w-4 h-4 ml-2"/>
                    </button_1.Button>
                </div>)}
        </div>);
}
//# sourceMappingURL=MyCoursesList.js.map