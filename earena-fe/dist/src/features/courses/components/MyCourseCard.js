'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyCourseCard = MyCourseCard;
const react_1 = __importDefault(require("react"));
const link_1 = __importDefault(require("next/link"));
const image_1 = __importDefault(require("next/image"));
const routes_1 = require("@/config/routes");
const progress_1 = require("@/shared/components/ui/progress");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
function MyCourseCard({ enrollment, isHero = false, className }) {
    const { course, progress, courseId, status } = enrollment;
    const isCompleted = progress === 100 || status === 'COMPLETED';
    return (<link_1.default href={routes_1.ROUTES.STUDENT.STUDY_ROOM(courseId)} className={(0, utils_1.cn)("group flex bg-card rounded-[2rem] border border-border/60 overflow-hidden transition-all duration-300", "hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/40", isHero ? "flex-col md:flex-row" : "flex-col", className)}>
            <div className={(0, utils_1.cn)("relative bg-secondary/50 overflow-hidden shrink-0", isHero ? "w-full md:w-5/12 lg:w-1/2 aspect-video md:aspect-auto" : "w-full aspect-video")}>
                {course.coverImage?.url ? (<image_1.default src={course.coverImage.url} alt={course.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes={isHero ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}/>) : (<div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground font-medium">
                        Chưa có ảnh bìa
                    </div>)}
                
                <div className="absolute top-4 left-4 flex gap-2">
                    {isCompleted ? (<span className="bg-green-500/90 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                            <lucide_react_1.CheckCircle2 className="w-3.5 h-3.5"/> Hoàn thành
                        </span>) : (<span className="bg-background/90 backdrop-blur-md text-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                            {status || 'Đang học'}
                        </span>)}
                </div>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-background/95 rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <lucide_react_1.PlayCircle className="w-8 h-8 text-primary ml-1"/>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col flex-1 bg-card relative z-10">
                <div>
                    <h3 className={(0, utils_1.cn)("font-black text-foreground line-clamp-2 group-hover:text-primary transition-colors", isHero ? "text-2xl md:text-3xl mb-4 leading-tight" : "text-xl mb-3")}>
                        {course.title}
                    </h3>

                    <div className="flex items-center gap-3 mt-4 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20 shrink-0">
                            {course.teacher.avatar ? (<image_1.default src={course.teacher.avatar} alt="Teacher" width={32} height={32} className="object-cover w-full h-full"/>) : (<lucide_react_1.User className="w-4 h-4 text-primary"/>)}
                        </div>
                        <span className="font-semibold text-muted-foreground text-sm truncate">
                            {course.teacher.fullName}
                        </span>
                    </div>
                </div>

                
                <div className="space-y-3 mt-auto pt-6">
                    <div className="flex justify-between items-end text-sm font-bold">
                        <span className={isCompleted ? 'text-green-600 dark:text-green-400' : 'text-primary'}>
                            {progress}% <span className="text-muted-foreground font-medium text-xs ml-1">tiến độ</span>
                        </span>
                    </div>
                    <progress_1.Progress value={progress} className="h-2.5 bg-secondary overflow-hidden"/>
                </div>
            </div>
        </link_1.default>);
}
//# sourceMappingURL=MyCourseCard.js.map