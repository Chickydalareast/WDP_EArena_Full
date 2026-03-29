'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, AlertCircle, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

// Import style lõi của react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// [CTO Mandatory]: Cấu hình Web Worker để parse PDF không làm đơ Main Thread của Next.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentViewerProps {
    url: string;
    originalName?: string;
    onTokenExpired?: () => void;
    isRefetching?: boolean;
    className?: string;
}

export function DocumentViewer({ url, originalName, onTokenExpired, isRefetching, className }: DocumentViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [hasError, setHasError] = useState<boolean>(false);

    // [CTO FIX]: Pattern chuẩn React 18: Adjusting state during render
    const [prevUrl, setPrevUrl] = useState<string>(url);
    if (url !== prevUrl) {
        setPrevUrl(url);
        setHasError(false); // Reset lỗi ngay lập tức mà không cần chờ re-render lần 2
    }

    const containerRef = useRef<HTMLDivElement>(null);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
        setHasError(false);
    };

    const onDocumentLoadError = (error: Error) => {
        setHasError(true);
        if (error.message.includes('403') || error.message.includes('401') || error.message.includes('Unexpected server response')) {
            if (onTokenExpired) {
                toast.info('Phiên đọc tài liệu hết hạn. Đang tải lại...', { id: 'pdf-refresh' });
                onTokenExpired();
            } else {
                toast.error('Không thể tải tài liệu. Vui lòng thử lại.');
            }
        } else {
            toast.error('Lỗi định dạng file hoặc đường dẫn không hợp lệ.');
        }
    };

    const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3.0));
    const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
    const handlePrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
    const handleNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));

    // Tối ưu Re-render: Chỉ memo lại file source
    const fileSource = useMemo(() => url, [url]);

    return (
        <div className={cn("flex flex-col w-full h-full bg-muted/10 border border-border rounded-xl overflow-hidden shadow-sm", className)}>

            {/* TOOLBAR */}
            <div className="flex flex-wrap items-center justify-between p-3 bg-card border-b border-border gap-3 sticky top-0 z-20">
                <div className="flex items-center gap-2 max-w-[40%]">
                    <FileText className="w-5 h-5 text-orange-500 shrink-0" />
                    <span className="text-sm font-semibold truncate" title={originalName || 'Tài liệu môn học'}>
                        {originalName || 'Tài liệu môn học'}
                    </span>
                </div>

                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevPage} disabled={pageNumber <= 1 || isRefetching || hasError}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-medium min-w-[60px] text-center select-none text-muted-foreground">
                        {numPages > 0 ? `${pageNumber} / ${numPages}` : '-- / --'}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextPage} disabled={pageNumber >= numPages || isRefetching || hasError}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50 hidden sm:flex">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut} disabled={isRefetching || hasError}>
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-xs font-medium w-12 text-center select-none text-muted-foreground">
                            {Math.round(scale * 100)}%
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn} disabled={isRefetching || hasError}>
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                    </div>

                    <a href={url} target="_blank" rel="noopener noreferrer" download={originalName}>
                        <Button variant="outline" size="sm" className="h-9 gap-2 hidden sm:flex" disabled={isRefetching || hasError}>
                            <Download className="w-4 h-4" /> Tải về
                        </Button>
                    </a>
                </div>
            </div>

            {/* VIEWER AREA */}
            <div className="relative flex-1 bg-slate-900/5 dark:bg-black/20 overflow-auto scrollbar-thin p-4 flex justify-center" ref={containerRef}>
                {(isRefetching || hasError) && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-all">
                        {isRefetching ? (
                            <>
                                <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
                                <p className="text-sm font-semibold text-foreground">Đang xác thực lại tài liệu...</p>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-10 h-10 text-destructive mb-3" />
                                <p className="text-sm font-semibold text-foreground">Không thể hiển thị tài liệu.</p>
                                <Button variant="outline" size="sm" className="mt-4" onClick={() => onTokenExpired && onTokenExpired()}>
                                    Thử tải lại
                                </Button>
                            </>
                        )}
                    </div>
                )}

                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                        <div className="flex flex-col items-center gap-4 mt-10">
                            <Skeleton className="w-[600px] max-w-full aspect-[1/1.4] rounded-lg shadow-md" />
                        </div>
                    }
                    className="flex flex-col items-center"
                >
                    {numPages > 0 && !hasError && (
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            className="shadow-xl ring-1 ring-border/50 rounded-sm bg-white"
                            loading={<Skeleton className="w-full h-full min-h-[500px]" />}
                        />
                    )}
                </Document>
            </div>
        </div>
    );
}