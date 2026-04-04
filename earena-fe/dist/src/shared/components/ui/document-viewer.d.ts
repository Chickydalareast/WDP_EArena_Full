import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
interface DocumentViewerProps {
    url: string;
    originalName?: string;
    onTokenExpired?: () => void;
    isRefetching?: boolean;
    className?: string;
}
export declare function DocumentViewer({ url, originalName, onTokenExpired, isRefetching, className }: DocumentViewerProps): any;
export {};
