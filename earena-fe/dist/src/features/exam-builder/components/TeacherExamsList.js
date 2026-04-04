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
exports.TeacherExamsList = TeacherExamsList;
const react_1 = __importStar(require("react"));
const link_1 = __importDefault(require("next/link"));
const date_fns_1 = require("date-fns");
const useTeacherExams_1 = require("../hooks/useTeacherExams");
const button_1 = require("@/shared/components/ui/button");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
function TeacherExamsList() {
    const [page, setPage] = (0, react_1.useState)(1);
    const { data, isLoading, isError } = (0, useTeacherExams_1.useTeacherExams)({ page, limit: 9 });
    const rawData = data?.data || data;
    const exams = rawData?.items || (Array.isArray(rawData) ? rawData : []);
    const meta = rawData?.meta;
    if (isLoading) {
        return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="bg-card border border-border/50 rounded-3xl p-6 flex flex-col h-[280px]">
            <div className="flex justify-between items-start mb-4 gap-4">
              <skeleton_1.Skeleton className="h-6 w-3/4"/>
              <skeleton_1.Skeleton className="h-6 w-20 rounded-full shrink-0"/>
            </div>
            <skeleton_1.Skeleton className="h-4 w-full mb-2"/>
            <skeleton_1.Skeleton className="h-4 w-2/3 mb-6"/>
            <div className="mt-auto space-y-3">
              <skeleton_1.Skeleton className="h-4 w-1/2"/>
              <skeleton_1.Skeleton className="h-4 w-1/3"/>
              <skeleton_1.Skeleton className="h-11 w-full mt-4 rounded-xl"/>
            </div>
          </div>))}
      </div>);
    }
    if (isError) {
        return (<div className="p-12 text-center text-destructive bg-destructive/5 rounded-3xl border border-destructive/20">
        <p className="font-bold text-lg">Lỗi khi tải danh sách đề thi.</p>
        <p className="text-sm mt-2 opacity-80">Vui lòng kiểm tra lại đường truyền và thử lại.</p>
      </div>);
    }
    if (exams.length === 0) {
        return (<div className="bg-card rounded-[2.5rem] border border-border/50 p-16 text-center shadow-sm">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <lucide_react_1.Plus className="w-12 h-12"/>
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-foreground mb-4">Chưa có đề thi nào</h3>
        <p className="text-muted-foreground mb-10 max-w-lg mx-auto text-lg">
          Bạn chưa tạo đề thi nào. Hãy bắt đầu bằng cách khởi tạo một vỏ đề trống để thêm các câu hỏi.
        </p>
        <link_1.default href="/teacher/exams/create">
          <button_1.Button size="lg" className="font-bold h-14 px-8 rounded-full shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
            Bắt đầu tạo đề ngay
          </button_1.Button>
        </link_1.default>
      </div>);
    }
    return (<div className="space-y-10 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {exams.map((exam) => (<div key={exam.id} className="bg-card rounded-3xl border border-border/60 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 p-6 flex flex-col relative group">

            
            <div className="flex justify-between items-start gap-3 mb-3">
              <h3 className="font-extrabold text-xl text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                {exam.title}
              </h3>
              <div className="shrink-0">
                {exam.isPublished ? (<span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                    <lucide_react_1.CheckCircle2 className="w-3.5 h-3.5"/> Đã xuất bản
                  </span>) : (<span className="bg-secondary text-secondary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Bản nháp
                  </span>)}
              </div>
            </div>

            
            {exam.description && (<p className="text-sm text-muted-foreground line-clamp-2 mb-4 font-medium">
                    {exam.description}
                </p>)}

            
            <div className="space-y-2.5 mb-6 mt-auto text-sm font-medium text-muted-foreground">
              {exam.createdAt && (<div className="flex items-center gap-2">
                    <lucide_react_1.Calendar className="w-4 h-4 text-slate-400"/>
                    Ngày tạo: <span className="text-foreground">{(0, date_fns_1.format)(new Date(exam.createdAt), 'dd/MM/yyyy')}</span>
                  </div>)}
              <div className="flex items-center gap-2">
                <lucide_react_1.Clock className="w-4 h-4 text-slate-400"/>
                Thời gian: <span className="text-foreground">{exam.duration ? `${exam.duration} phút` : 'Chưa cấu hình'}</span>
              </div>
              <div className="flex items-center gap-2">
                <lucide_react_1.FileText className="w-4 h-4 text-slate-400"/>
                Tổng điểm: <span className="text-foreground">{exam.totalScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <lucide_react_1.BookOpen className="w-4 h-4 text-slate-400"/>
                Loại đề: <span className="text-foreground">{exam.type === 'PRACTICE' ? 'Luyện tập' : exam.type}</span>
              </div>
            </div>

            
            <div className="pt-5 border-t border-border/50">
              <link_1.default href={`/teacher/exams/${exam.id}/builder?paperId=${exam.defaultPaperId || ''}&isPublished=${exam.isPublished}`} className="block w-full">
                <button_1.Button variant={exam.isPublished ? "outline" : "default"} className={(0, utils_1.cn)("w-full rounded-xl font-bold h-11 transition-all", !exam.isPublished && "shadow-md shadow-primary/20")}>
                  {exam.isPublished ? (<><lucide_react_1.Eye className="w-4 h-4 mr-2"/> Xem chi tiết đề</>) : (<><lucide_react_1.Edit3 className="w-4 h-4 mr-2"/> Tiếp tục soạn đề</>)}
                </button_1.Button>
              </link_1.default>
            </div>
          </div>))}
      </div>

      
      {meta && meta.totalPages > 1 && (<div className="flex items-center justify-center gap-4 pt-6 border-t border-border/50">
          <button_1.Button variant="outline" disabled={page <= 1} onClick={() => {
                setPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }} className="font-semibold rounded-full px-6 h-12">
            Trang trước
          </button_1.Button>
          <span className="text-sm font-bold bg-secondary px-4 py-2 rounded-full text-secondary-foreground">
            {page} / {meta.totalPages}
          </span>
          <button_1.Button variant="outline" disabled={page >= meta.totalPages} onClick={() => {
                setPage(p => p + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }} className="font-semibold rounded-full px-6 h-12">
            Trang tiếp
          </button_1.Button>
        </div>)}
    </div>);
}
//# sourceMappingURL=TeacherExamsList.js.map