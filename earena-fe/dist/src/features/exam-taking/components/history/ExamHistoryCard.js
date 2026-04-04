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
exports.ExamHistoryCard = ExamHistoryCard;
const react_1 = __importStar(require("react"));
const link_1 = __importDefault(require("next/link"));
const date_fns_1 = require("date-fns");
const useExamHistory_1 = require("../../hooks/useExamHistory");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/shared/components/ui/button");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const routes_1 = require("@/config/routes");
const utils_1 = require("@/shared/lib/utils");
function ExamHistoryCard({ overview }) {
    const [isExpanded, setIsExpanded] = (0, react_1.useState)(false);
    const { data: attempts, isLoading, isError } = (0, useExamHistory_1.useLessonAttempts)(overview.lessonId, isExpanded);
    const isPassed = overview.bestScore !== null && overview.passPercentage !== null
        ? (overview.bestScore / 10) * 100 >= overview.passPercentage
        : false;
    return (<div className={(0, utils_1.cn)("bg-card rounded-[2rem] border transition-all duration-300 overflow-hidden", isExpanded ? "border-primary shadow-lg shadow-primary/10" : "border-border/60 hover:border-primary/40 shadow-sm")}>
            
            <div className="p-6 md:p-8 cursor-pointer select-none flex flex-col md:flex-row gap-6 justify-between md:items-center" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                        <lucide_react_1.BookOpen className="w-4 h-4 text-primary"/>
                        {overview.courseTitle}
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-foreground">{overview.lessonTitle}</h3>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm font-medium">
                        <div className="bg-secondary px-3 py-1.5 rounded-lg flex items-center gap-2">
                            <lucide_react_1.Clock className="w-4 h-4 text-muted-foreground"/>
                            <span>Đã thử: <strong className="text-foreground">{overview.attemptsUsed}</strong> / {overview.maxAttempts || '∞'}</span>
                        </div>
                        {overview.isLatestInProgress && (<div className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
                                <lucide_react_1.PlayCircle className="w-4 h-4"/> Đang làm dở
                            </div>)}
                    </div>
                </div>

                
                <div className="flex items-center gap-6 shrink-0 border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-8">
                    <div className="text-center">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Điểm cao nhất</p>
                        <div className="text-3xl font-black text-foreground flex items-baseline gap-1">
                            {overview.bestScore !== null && overview.bestScore !== undefined ? (<span className={isPassed ? "text-green-600 dark:text-green-500" : "text-primary"}>{overview.bestScore.toFixed(1)}</span>) : (<span className="text-muted-foreground">-</span>)}
                            <span className="text-lg text-muted-foreground">/10</span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground transition-transform">
                        {isExpanded ? <lucide_react_1.ChevronUp className="w-6 h-6"/> : <lucide_react_1.ChevronDown className="w-6 h-6"/>}
                    </div>
                </div>
            </div>

            
            <div className={(0, utils_1.cn)("grid transition-all duration-300 ease-in-out", isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                <div className="overflow-hidden">
                    <div className="p-6 md:p-8 bg-secondary/30 border-t border-border/50 space-y-4">
                        <h4 className="font-bold text-foreground mb-4">Chi tiết các lần làm bài</h4>

                        {isLoading && (<div className="space-y-3">
                                <skeleton_1.Skeleton className="w-full h-16 rounded-xl"/>
                                <skeleton_1.Skeleton className="w-full h-16 rounded-xl"/>
                            </div>)}

                        {isError && (<div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-bold flex items-center gap-2">
                                <lucide_react_1.AlertCircle className="w-5 h-5"/> Không thể tải chi tiết lần thi.
                            </div>)}

                        {attempts && attempts.length > 0 && (<div className="space-y-3">
                                {attempts.map((attempt, idx) => (<AttemptDetailRow key={attempt._id} attempt={attempt} index={attempts.length - idx} courseId={overview.courseId} lessonId={overview.lessonId}/>))}
                            </div>)}
                    </div>
                </div>
            </div>
        </div>);
}
function AttemptDetailRow({ attempt, index, courseId, lessonId }) {
    const isCompleted = attempt.status === 'COMPLETED';
    const formatTime = (seconds) => {
        if (!seconds)
            return '--:--';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}p ${s}s`;
    };
    const formatDateTimeSafe = (dateStr) => {
        if (!dateStr)
            return '--/--/----';
        const date = new Date(dateStr);
        if (isNaN(date.getTime()))
            return '--/--/----';
        return (0, date_fns_1.format)(date, 'HH:mm dd/MM/yyyy');
    };
    return (<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-card border border-border/60 rounded-xl hover:border-primary/30 transition-colors gap-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center shrink-0">
                    #{index}
                </div>
                <div>
                    <div className="font-bold text-foreground">
                        {isCompleted
            ? `Điểm số: ${attempt.score?.toFixed(1) ?? '-'} / 10`
            : 'Trạng thái: Đang làm bài'}
                    </div>
                    <div className="text-xs font-medium text-muted-foreground mt-1 space-x-3">
                        
                        <span>Bắt đầu: {formatDateTimeSafe(attempt.startedAt)}</span>
                        {isCompleted && <span>• Thời gian: {formatTime(attempt.timeSpent)}</span>}
                    </div>
                </div>
            </div>

            <div className="w-full sm:w-auto shrink-0">
                {isCompleted ? (<link_1.default href={routes_1.ROUTES.STUDENT.EXAM_RESULT(attempt._id)}>
                        <button_1.Button variant="outline" className="w-full font-bold">
                            Xem kết quả
                        </button_1.Button>
                    </link_1.default>) : (<link_1.default href={routes_1.ROUTES.STUDENT.STUDY_ROOM(courseId, lessonId)}>
                        <button_1.Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold">
                            Tiếp tục thi <lucide_react_1.PlayCircle className="w-4 h-4 ml-2"/>
                        </button_1.Button>
                    </link_1.default>)}
            </div>
        </div>);
}
//# sourceMappingURL=ExamHistoryCard.js.map