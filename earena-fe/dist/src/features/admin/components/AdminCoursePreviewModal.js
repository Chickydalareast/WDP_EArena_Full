'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCoursePreviewModal = AdminCoursePreviewModal;
const react_1 = require("react");
const dialog_1 = require("@/shared/components/ui/dialog");
const useAdminCourses_1 = require("../hooks/useAdminCourses");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/shared/components/ui/button");
const utils_1 = require("@/shared/lib/utils");
const dynamic_1 = __importDefault(require("next/dynamic"));
const useAdminExams_1 = require("../hooks/useAdminExams");
const DocumentViewer = (0, dynamic_1.default)(() => import('@/shared/components/ui/document-viewer').then((mod) => mod.DocumentViewer), {
    ssr: false,
    loading: () => (<div className="flex flex-col items-center justify-center h-full w-full gap-4 bg-slate-900/5 dark:bg-black/20">
                <lucide_react_1.Loader2 className="w-8 h-8 animate-spin text-primary"/>
                <p className="text-sm font-semibold text-muted-foreground">Đang khởi tạo trình xem PDF...</p>
            </div>)
});
const MediaGallery = ({ mediaList }) => {
    if (!mediaList || mediaList.length === 0)
        return null;
    return (<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
            {mediaList.map((media) => {
            const isImage = media.mimetype.startsWith('image/');
            const isAudio = media.mimetype.startsWith('audio/');
            return (<div key={media._id} className="relative group bg-muted/50 rounded-xl border border-border overflow-hidden flex flex-col justify-center p-2">
                        {isImage && <img src={media.url} alt={media.originalName} loading="lazy" className="max-h-[160px] w-full object-contain rounded-lg mx-auto"/>}
                        {isAudio && (<div className="w-full px-3 py-2 flex flex-col items-center">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 w-full text-left">Audio file</span>
                                <audio src={media.url} controls className="w-full h-8 outline-none"/>
                            </div>)}
                    </div>);
        })}
        </div>);
};
const ReadOnlyAnswers = ({ answers, correctAnswerId }) => {
    if (!answers || answers.length === 0)
        return null;
    return (<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {answers.map((ans) => {
            const isCorrect = ans.id === correctAnswerId;
            return (<div key={ans.id} className={(0, utils_1.cn)("flex border rounded-xl overflow-hidden transition-all shadow-sm", isCorrect ? "bg-green-50 border-green-500" : "bg-card border-border")}>
                        <div className={(0, utils_1.cn)("flex items-center justify-center w-10 shrink-0 font-bold text-sm transition-colors", isCorrect ? "bg-green-500 text-white" : "bg-muted text-muted-foreground border-r border-border")}>
                            {ans.id}
                        </div>
                        <div className="flex-1 p-3 min-w-0 flex items-center">
                            <div className={(0, utils_1.cn)("text-sm w-full prose prose-sm max-w-none break-words [&>p]:m-0", isCorrect ? "text-green-900 font-bold" : "text-foreground")} dangerouslySetInnerHTML={{ __html: ans.content }}/>
                        </div>
                    </div>);
        })}
        </div>);
};
const AdminQuizViewer = ({ examId }) => {
    const { data: paperResponse, isLoading, error } = (0, useAdminExams_1.useAdminPaperDetailByExam)(examId);
    if (isLoading) {
        return (<div className="p-16 flex flex-col items-center justify-center bg-card border border-border rounded-2xl w-full shadow-sm">
                <lucide_react_1.Loader2 className="animate-spin text-primary w-10 h-10 mb-4"/>
                <p className="text-muted-foreground font-medium">Đang trích xuất nội dung đề thi...</p>
            </div>);
    }
    if (error || !paperResponse) {
        return (<div className="p-10 text-center bg-destructive/5 border border-destructive/20 rounded-2xl w-full">
                <lucide_react_1.AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3"/>
                <h3 className="font-bold text-destructive text-lg">Lỗi tải dữ liệu</h3>
                <p className="text-destructive/80 text-sm mt-1">Không thể lấy dữ liệu đề thi từ máy chủ. Vui lòng thử lại.</p>
            </div>);
    }
    const responseObj = paperResponse;
    const paper = responseObj && typeof responseObj === 'object' && 'data' in responseObj
        ? responseObj.data
        : responseObj;
    const questions = paper?.questions || [];
    const answerKeys = paper?.answerKeys || [];
    const getCorrectAnswerId = (qId) => answerKeys.find(k => k.originalQuestionId === qId)?.correctAnswerId;
    if (questions.length === 0) {
        return (<div className="p-16 text-center bg-card border border-border rounded-2xl w-full">
                <lucide_react_1.BrainCircuit className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50"/>
                <h3 className="font-bold text-foreground text-lg">Đề thi chưa soạn</h3>
                <p className="text-muted-foreground text-sm mt-1">Giáo viên chưa thêm bất kỳ câu hỏi nào vào bộ đề này.</p>
            </div>);
    }
    return (<div className="space-y-6 w-full animate-in fade-in duration-500">
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-lg shrink-0">
                    <lucide_react_1.BrainCircuit className="text-primary w-6 h-6"/>
                </div>
                <div>
                    <h3 className="font-bold text-primary text-lg tracking-tight">Thẩm định Đề thi (Chỉ đọc)</h3>
                    <p className="text-sm text-primary/80 font-medium">Hiển thị cấu trúc câu hỏi, Media đính kèm và Đáp án đúng đã được khai báo.</p>
                </div>
            </div>

            {questions.map((q, index) => {
            const isPassage = q.type === 'PASSAGE';
            const correctId = getCorrectAnswerId(q.originalQuestionId || q._id);
            return (<div key={q.originalQuestionId || q._id || index} className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
                        <div className="flex gap-4">
                            <div className="shrink-0 w-8 h-8 bg-slate-800 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm mt-0.5">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                {isPassage && <span className="text-[10px] font-bold uppercase text-purple-600 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded inline-block mb-3 shadow-sm">Khối bài đọc</span>}

                                <div className="prose prose-sm max-w-none text-foreground font-medium break-words [&>p]:m-0 leading-relaxed w-full mb-4" dangerouslySetInnerHTML={{ __html: q.content }}/>

                                <MediaGallery mediaList={q.attachedMedia}/>

                                {isPassage ? (<div className="space-y-4 mt-6 border-l-2 border-border pl-4 md:pl-6">
                                        {q.subQuestions?.map((subQ, subIdx) => {
                        const subCorrectId = getCorrectAnswerId(subQ.originalQuestionId || subQ._id);
                        return (<div key={subQ.originalQuestionId || subQ._id || subIdx} className="bg-muted/30 p-4 md:p-5 rounded-xl border border-border">
                                                    <div className="flex gap-3 md:gap-4">
                                                        <div className="w-7 h-7 bg-muted-foreground/10 text-muted-foreground rounded-md flex items-center justify-center font-bold text-xs shrink-0">{subIdx + 1}</div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="prose prose-sm max-w-none text-foreground font-medium break-words [&>p]:m-0 leading-relaxed w-full mb-3" dangerouslySetInnerHTML={{ __html: subQ.content }}/>
                                                            <MediaGallery mediaList={subQ.attachedMedia}/>
                                                            <ReadOnlyAnswers answers={subQ.answers} correctAnswerId={subCorrectId}/>
                                                        </div>
                                                    </div>
                                                </div>);
                    })}
                                    </div>) : (<ReadOnlyAnswers answers={q.answers} correctAnswerId={correctId}/>)}
                            </div>
                        </div>
                    </div>);
        })}
        </div>);
};
function AdminCoursePreviewModal({ courseId, isOpen, onClose }) {
    const { data: courseDetail, isLoading } = (0, useAdminCourses_1.useAdminCourseDetail)(courseId);
    const [activeLessonId, setActiveLessonId] = (0, react_1.useState)(null);
    const [activeAttachmentId, setActiveAttachmentId] = (0, react_1.useState)(null);
    const { activeLesson, curriculumTree } = (0, react_1.useMemo)(() => {
        if (!courseDetail)
            return { activeLesson: null, curriculumTree: [] };
        const sections = courseDetail.sections || [];
        const lessonsMap = new Map();
        for (const section of sections) {
            for (const lesson of section.lessons || []) {
                lessonsMap.set(lesson.id, lesson);
            }
        }
        const currentId = activeLessonId || (sections[0]?.lessons[0]?.id || null);
        return {
            activeLesson: currentId ? lessonsMap.get(currentId) || null : null,
            curriculumTree: sections
        };
    }, [courseDetail, activeLessonId]);
    (0, react_1.useEffect)(() => {
        setActiveAttachmentId(null);
    }, [activeLessonId]);
    const activeAttachment = (0, react_1.useMemo)(() => {
        if (!activeAttachmentId || !activeLesson?.attachments)
            return null;
        return activeLesson.attachments.find(a => a.id === activeAttachmentId) || null;
    }, [activeAttachmentId, activeLesson?.attachments]);
    return (<dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <dialog_1.DialogContent className="max-w-[95vw] sm:max-w-screen-2xl w-full h-[90vh] p-0 gap-0 overflow-hidden flex flex-row bg-background border border-border rounded-xl shadow-2xl animate-in fade-in duration-300">
                <dialog_1.DialogTitle className="sr-only">Thẩm định khóa học</dialog_1.DialogTitle>
                <dialog_1.DialogDescription className="sr-only">Chế độ xem trước nội dung khóa học dành cho Admin</dialog_1.DialogDescription>

                {isLoading ? (<div className="flex-1 h-full flex items-center justify-center bg-card"><lucide_react_1.Loader2 className="w-12 h-12 animate-spin text-primary"/></div>) : (<>
                        
                        <aside className="w-[360px] h-full shrink-0 border-r border-border bg-card/80 backdrop-blur-sm flex flex-col">
                            <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-card shrink-0">
                                <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <lucide_react_1.BrainCircuit className="size-5 text-primary"/>
                                </div>
                                <h2 className="text-lg font-extrabold tracking-tight">EArena Review</h2>
                            </div>

                            <div className="flex-1 w-full overflow-y-auto scrollbar-thin">
                                <div className="p-4 space-y-6">
                                    {curriculumTree.length === 0 ? (<p className="text-sm text-muted-foreground italic px-2">Khóa học trống.</p>) : curriculumTree.map((section, idx) => (<div key={section.id} className="space-y-1.5">
                                            <h4 className="text-xs font-bold uppercase text-muted-foreground px-2.5 tracking-wider">
                                                Chương {idx + 1}: {section.title}
                                            </h4>
                                            {section.lessons?.map((lesson) => (<button key={lesson.id} onClick={() => setActiveLessonId(lesson.id)} className={(0, utils_1.cn)("w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors text-sm font-medium", activeLesson?.id === lesson.id
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-inner'
                        : 'hover:bg-accent text-foreground')}>
                                                    {lesson.examId ? <lucide_react_1.BrainCircuit className="w-4 h-4 shrink-0 text-purple-500"/> : lesson.primaryVideo ? <lucide_react_1.Play className="w-4 h-4 shrink-0 text-blue-500"/> : <lucide_react_1.FileText className="w-4 h-4 shrink-0 text-orange-500"/>}
                                                    <span className="truncate flex-1">{lesson.title}</span>
                                                    {lesson.isFreePreview && <span className="text-[10px] font-bold bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded">Free</span>}
                                                </button>))}
                                        </div>))}
                                </div>
                            </div>
                        </aside>

                        
                        <main className="flex-1 h-full flex flex-col relative bg-muted/20">
                            <header className="px-8 py-3.5 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between gap-6 shrink-0 z-10 sticky top-0">
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight text-foreground line-clamp-1">{courseDetail?.title}</h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">Admin Preview Mode - Bỏ qua các ràng buộc khóa học</p>
                                </div>
                                <button_1.Button variant="ghost" size="icon" onClick={onClose} className="rounded-full size-9 shrink-0"><lucide_react_1.X className="size-5"/></button_1.Button>
                            </header>

                            {curriculumTree.length === 0 ? (<div className="flex-1 h-full flex flex-col items-center justify-center gap-4 text-center bg-card p-12">
                                    <lucide_react_1.AlertCircle className="w-16 h-16 text-muted-foreground/50"/>
                                    <h3 className="text-xl font-semibold text-muted-foreground">Khóa học này chưa có nội dung bài học.</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mt-1">Giáo viên cần bổ sung ít nhất một chương học và một bài học trước khi gửi yêu cầu kiểm duyệt.</p>
                                </div>) : activeLesson ? (<div className="flex-1 w-full h-full overflow-y-auto scrollbar-thin pb-12">
                                    <div className="w-full flex flex-col">

                                        
                                        {activeLesson.primaryVideo?.url && (<div className="w-full bg-slate-950 dark:bg-black p-8 flex justify-center border-b border-border/50">
                                                <div className="w-full max-w-5xl mx-auto aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/5">
                                                    <video src={activeLesson.primaryVideo.url} controls className="w-full h-full object-contain bg-black"/>
                                                </div>
                                            </div>)}

                                        <div className="p-10 max-w-5xl mx-auto w-full space-y-10">
                                            <h2 className="text-4xl font-extrabold text-foreground tracking-tighter line-clamp-2">{activeLesson.title}</h2>

                                            {activeLesson.content && activeLesson.content !== '<p></p>' && (<article className="prose prose-base dark:prose-invert prose-orange max-w-none bg-card p-8 rounded-2xl border border-border shadow-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: activeLesson.content }}/>)}

                                            
                                            {activeLesson.examId && (<div className="pt-4 border-t border-border">
                                                    <AdminQuizViewer examId={activeLesson.examId}/>
                                                </div>)}

                                            
                                            {activeLesson.attachments && activeLesson.attachments.length > 0 && (<div className="pt-8 border-t border-border">
                                                    <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-foreground"><lucide_react_1.FileText className="size-6 text-orange-500"/> Tài liệu đính kèm</h3>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                        {activeLesson.attachments.map((file) => (<button key={file.id} onClick={() => setActiveAttachmentId(file.id)} className={(0, utils_1.cn)("p-4 border bg-card rounded-xl flex items-center gap-4 transition-all shadow-sm text-left outline-none", activeAttachmentId === file.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:bg-muted hover:border-primary/30")}>
                                                                <div className="p-2 rounded-lg bg-orange-500/10"><lucide_react_1.FileText className="size-6 text-orange-400 shrink-0"/></div>
                                                                <span className="font-medium text-sm truncate flex-1" title={file.originalName}>{file.originalName}</span>
                                                                <lucide_react_1.Eye className="size-4 text-muted-foreground shrink-0"/>
                                                            </button>))}
                                                    </div>

                                                    {activeAttachment && activeAttachment.url && (<div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 ring-1 ring-primary/20">
                                                            <div className="flex items-center justify-between p-3 px-4 bg-muted/40 border-b border-border">
                                                                <span className="font-semibold text-sm text-foreground flex items-center gap-2 truncate pr-4">
                                                                    <lucide_react_1.Eye className="w-4 h-4 text-primary shrink-0"/> Đang xem: <span className="truncate">{activeAttachment.originalName}</span>
                                                                </span>
                                                                <button_1.Button variant="ghost" size="sm" onClick={() => setActiveAttachmentId(null)} className="shrink-0 h-8 gap-1.5 text-muted-foreground hover:text-foreground">
                                                                    <lucide_react_1.X className="w-4 h-4"/> Đóng file
                                                                </button_1.Button>
                                                            </div>
                                                            <div className="h-[75vh] w-full bg-slate-900/5 dark:bg-black/20">
                                                                <DocumentViewer url={activeAttachment.url} originalName={activeAttachment.originalName} className="border-none rounded-none shadow-none h-full"/>
                                                            </div>
                                                        </div>)}
                                                </div>)}
                                        </div>
                                    </div>
                                </div>) : null}
                        </main>
                    </>)}
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=AdminCoursePreviewModal.js.map