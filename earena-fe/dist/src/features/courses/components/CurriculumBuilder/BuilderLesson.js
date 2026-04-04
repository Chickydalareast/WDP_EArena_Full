'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderLesson = BuilderLesson;
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
function BuilderLesson({ lesson, sectionId, isTotalLocked, isStructureLocked, onEdit, onDelete, }) {
    const getIcon = () => {
        if (lesson.examId) {
            if (lesson.examMode === 'DYNAMIC') {
                return <lucide_react_1.Zap className="w-4 h-4 text-purple-600 shrink-0 fill-purple-100"/>;
            }
            return <lucide_react_1.HelpCircle className="w-4 h-4 text-purple-500 shrink-0"/>;
        }
        if (lesson.primaryVideo)
            return <lucide_react_1.PlayCircle className="w-4 h-4 text-blue-500 shrink-0"/>;
        return <lucide_react_1.FileText className="w-4 h-4 text-orange-500 shrink-0"/>;
    };
    const formatDate = (isoString) => {
        if (!isoString)
            return '';
        return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(isoString));
    };
    const isDeleteDisabled = isTotalLocked || isStructureLocked;
    return (<div className="flex items-center justify-between p-3 bg-white border border-border rounded-md ml-8 hover:border-primary/50 transition-colors group/lesson shadow-sm">
            <div className="flex items-center gap-3 w-full">
                <div className="relative group/drag cursor-not-allowed">
                    <lucide_react_1.GripVertical className="w-4 h-4 text-muted-foreground/30"/>
                </div>

                {getIcon()}

                <div className="flex flex-col flex-1 truncate">
                    <span className="text-sm font-semibold truncate text-slate-700">{lesson.title}</span>
                    {lesson.updatedAt && (<span className="text-[10px] text-muted-foreground mt-0.5 font-medium">Cập nhật: {formatDate(lesson.updatedAt)}</span>)}
                </div>

                <button onClick={() => onEdit(lesson)} disabled={isTotalLocked} className={(0, utils_1.cn)("p-1.5 ml-2 rounded transition-colors", isTotalLocked ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-blue-600 hover:bg-blue-50")}>
                    <lucide_react_1.Edit2 className="w-4 h-4"/>
                </button>

                <div className="relative group/trash flex items-center">
                    <button onClick={() => onDelete('LESSON', lesson.id, lesson.title, sectionId)} disabled={isDeleteDisabled} className={(0, utils_1.cn)("p-1.5 rounded transition-colors", isDeleteDisabled ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-red-600 hover:bg-red-50")}>
                        <lucide_react_1.Trash2 className="w-4 h-4"/>
                    </button>
                </div>
            </div>

            {lesson.isFreePreview && (<span className="ml-3 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase shrink-0">
                    Free
                </span>)}
        </div>);
}
//# sourceMappingURL=BuilderLesson.js.map