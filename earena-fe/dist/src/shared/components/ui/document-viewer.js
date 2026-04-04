'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentViewer = DocumentViewer;
const react_1 = require("react");
const react_pdf_1 = require("react-pdf");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/shared/components/ui/button");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const utils_1 = require("@/shared/lib/utils");
const sonner_1 = require("sonner");
require("react-pdf/dist/Page/AnnotationLayer.css");
require("react-pdf/dist/Page/TextLayer.css");
react_pdf_1.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${react_pdf_1.pdfjs.version}/build/pdf.worker.min.mjs`;
function DocumentViewer({ url, originalName, onTokenExpired, isRefetching, className }) {
    const [numPages, setNumPages] = (0, react_1.useState)(0);
    const [pageNumber, setPageNumber] = (0, react_1.useState)(1);
    const [scale, setScale] = (0, react_1.useState)(1.0);
    const [hasError, setHasError] = (0, react_1.useState)(false);
    const [prevUrl, setPrevUrl] = (0, react_1.useState)(url);
    if (url !== prevUrl) {
        setPrevUrl(url);
        setHasError(false);
    }
    const containerRef = (0, react_1.useRef)(null);
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
        setHasError(false);
    };
    const onDocumentLoadError = (error) => {
        setHasError(true);
        if (error.message.includes('403') || error.message.includes('401') || error.message.includes('Unexpected server response')) {
            if (onTokenExpired) {
                sonner_1.toast.info('Phiên đọc tài liệu hết hạn. Đang tải lại...', { id: 'pdf-refresh' });
                onTokenExpired();
            }
            else {
                sonner_1.toast.error('Không thể tải tài liệu. Vui lòng thử lại.');
            }
        }
        else {
            sonner_1.toast.error('Lỗi định dạng file hoặc đường dẫn không hợp lệ.');
        }
    };
    const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3.0));
    const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
    const handlePrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
    const handleNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
    const fileSource = (0, react_1.useMemo)(() => url, [url]);
    return (<div className={(0, utils_1.cn)("flex flex-col w-full h-full bg-muted/10 border border-border rounded-xl overflow-hidden shadow-sm", className)}>

            
            <div className="flex flex-wrap items-center justify-between p-3 bg-card border-b border-border gap-3 sticky top-0 z-20">
                <div className="flex items-center gap-2 max-w-[40%]">
                    <lucide_react_1.FileText className="w-5 h-5 text-orange-500 shrink-0"/>
                    <span className="text-sm font-semibold truncate" title={originalName || 'Tài liệu môn học'}>
                        {originalName || 'Tài liệu môn học'}
                    </span>
                </div>

                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
                    <button_1.Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevPage} disabled={pageNumber <= 1 || isRefetching || hasError}>
                        <lucide_react_1.ChevronLeft className="w-4 h-4"/>
                    </button_1.Button>
                    <span className="text-xs font-medium min-w-[60px] text-center select-none text-muted-foreground">
                        {numPages > 0 ? `${pageNumber} / ${numPages}` : '-- / --'}
                    </span>
                    <button_1.Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextPage} disabled={pageNumber >= numPages || isRefetching || hasError}>
                        <lucide_react_1.ChevronRight className="w-4 h-4"/>
                    </button_1.Button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50 hidden sm:flex">
                        <button_1.Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut} disabled={isRefetching || hasError}>
                            <lucide_react_1.ZoomOut className="w-4 h-4"/>
                        </button_1.Button>
                        <span className="text-xs font-medium w-12 text-center select-none text-muted-foreground">
                            {Math.round(scale * 100)}%
                        </span>
                        <button_1.Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn} disabled={isRefetching || hasError}>
                            <lucide_react_1.ZoomIn className="w-4 h-4"/>
                        </button_1.Button>
                    </div>

                    <a href={url} target="_blank" rel="noopener noreferrer" download={originalName}>
                        <button_1.Button variant="outline" size="sm" className="h-9 gap-2 hidden sm:flex" disabled={isRefetching || hasError}>
                            <lucide_react_1.Download className="w-4 h-4"/> Tải về
                        </button_1.Button>
                    </a>
                </div>
            </div>

            
            <div className="relative flex-1 bg-slate-900/5 dark:bg-black/20 overflow-auto scrollbar-thin p-4 flex justify-center" ref={containerRef}>
                {(isRefetching || hasError) && (<div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-all">
                        {isRefetching ? (<>
                                <lucide_react_1.Loader2 className="w-10 h-10 animate-spin text-primary mb-3"/>
                                <p className="text-sm font-semibold text-foreground">Đang xác thực lại tài liệu...</p>
                            </>) : (<>
                                <lucide_react_1.AlertCircle className="w-10 h-10 text-destructive mb-3"/>
                                <p className="text-sm font-semibold text-foreground">Không thể hiển thị tài liệu.</p>
                                <button_1.Button variant="outline" size="sm" className="mt-4" onClick={() => onTokenExpired && onTokenExpired()}>
                                    Thử tải lại
                                </button_1.Button>
                            </>)}
                    </div>)}

                <react_pdf_1.Document file={url} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError} loading={<div className="flex flex-col items-center gap-4 mt-10">
                            <skeleton_1.Skeleton className="w-[600px] max-w-full aspect-[1/1.4] rounded-lg shadow-md"/>
                        </div>} className="flex flex-col items-center">
                    {numPages > 0 && !hasError && (<react_pdf_1.Page pageNumber={pageNumber} scale={scale} renderTextLayer={true} renderAnnotationLayer={true} className="shadow-xl ring-1 ring-border/50 rounded-sm bg-white" loading={<skeleton_1.Skeleton className="w-full h-full min-h-[500px]"/>}/>)}
                </react_pdf_1.Document>
            </div>
        </div>);
}
//# sourceMappingURL=document-viewer.js.map