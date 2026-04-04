'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudySidebar = StudySidebar;
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
const react_1 = require("react");
function StudySidebar({ sections, currentLessonId, treeStatus = 'ACTIVE', progressionMode = 'FREE' }) {
    const router = (0, navigation_1.useRouter)();
    const pathname = (0, navigation_1.usePathname)();
    const [openSections, setOpenSections] = (0, react_1.useState)(() => {
        const initialState = {};
        sections.forEach(sec => {
            initialState[sec.id] = sec.lessons.some(l => l.id === currentLessonId) || true;
        });
        return initialState;
    });
    const linearLockMap = (0, react_1.useMemo)(() => {
        const map = {};
        if (progressionMode !== 'STRICT_LINEAR')
            return map;
        const flatLessons = sections.flatMap(sec => sec.lessons);
        flatLessons.forEach((lesson, index) => {
            if (index === 0) {
                map[lesson.id] = false;
            }
            else {
                const prevLesson = flatLessons[index - 1];
                map[lesson.id] = !prevLesson.isCompleted;
            }
        });
        return map;
    }, [sections, progressionMode]);
    const toggleSection = (sectionId) => {
        setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };
    const onLessonSelect = (lessonId, isFreePreview, isLocked) => {
        if (isLocked)
            return;
        router.push(`${pathname}?lessonId=${lessonId}`, { scroll: false });
    };
    const getIcon = (lesson) => {
        if (lesson.examId)
            return <lucide_react_1.HelpCircle className="w-4 h-4"/>;
        if (lesson.primaryVideo || lesson.primaryVideoId || lesson.mediaId)
            return <lucide_react_1.PlayCircle className="w-4 h-4"/>;
        return <lucide_react_1.FileText className="w-4 h-4"/>;
    };
    const getLabel = (lesson) => {
        if (lesson.examId)
            return 'Bài tập';
        if (lesson.primaryVideo || lesson.primaryVideoId || lesson.mediaId)
            return 'Video';
        return 'Lý thuyết';
    };
    return (<div className="flex flex-col w-full">
      {sections.map((section, index) => (<div key={section.id} className="border-b border-border">
          <button onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between p-4 bg-muted/10 hover:bg-muted/30 transition-colors text-left outline-none focus-visible:ring-2 ring-primary inset-ring">
            <span className="font-bold text-sm text-foreground">
              Phần {index + 1}: {section.title}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {section.lessons.filter(l => l.isCompleted).length}/{section.lessons.length}
            </span>
          </button>

          {openSections[section.id] && (<div className="flex flex-col py-1">
              {section.lessons.map((lesson) => {
                    const isActive = lesson.id === currentLessonId;
                    const isLinearLocked = linearLockMap[lesson.id];
                    const isStatusLocked = treeStatus !== 'ACTIVE' && !lesson.isFreePreview;
                    const isLocked = isLinearLocked || isStatusLocked;
                    return (<button key={lesson.id} onClick={() => onLessonSelect(lesson.id, lesson.isFreePreview, isLocked)} disabled={isLocked} className={(0, utils_1.cn)("flex items-center gap-3 px-4 py-3 text-left transition-colors relative group outline-none", isActive ? "bg-primary/10" : "hover:bg-muted/50", isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent")}>
                    {isActive && (<div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"/>)}
                    
                    {lesson.isCompleted ? (<lucide_react_1.CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/>) : (<div className="w-5 h-5 rounded-full border border-muted-foreground/40 shrink-0 flex items-center justify-center bg-background">
                         {isLocked && <lucide_react_1.Lock className="w-3 h-3 text-muted-foreground/60"/>}
                      </div>)}

                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className={(0, utils_1.cn)("text-sm font-medium truncate", isActive ? "text-primary" : "text-foreground group-hover:text-primary", isLocked && "group-hover:text-foreground text-muted-foreground")}>
                        {lesson.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                        {getIcon(lesson)}
                        <span>{getLabel(lesson)}</span>
                      </div>
                    </div>
                  </button>);
                })}
            </div>)}
        </div>))}
    </div>);
}
//# sourceMappingURL=StudySidebar.js.map