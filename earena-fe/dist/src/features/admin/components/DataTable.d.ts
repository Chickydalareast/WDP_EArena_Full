import { ReactNode } from 'react';
export declare function DataTable({ columns, rows, empty, emptyMessage, isLoading, }: {
    columns: Array<{
        key: string;
        header: ReactNode;
        className?: string;
    }>;
    rows: Array<Record<string, ReactNode>>;
    empty?: string;
    emptyMessage?: string;
    isLoading?: boolean;
}): any;
export declare function PaginationBar({ page, totalPages, onPageChange, }: {
    page: number;
    totalPages: number;
    onPageChange: (p: number) => void;
}): any;
