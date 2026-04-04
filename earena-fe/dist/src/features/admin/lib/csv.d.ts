export declare function downloadCsv({ filename, headers, rows, }: {
    filename: string;
    headers: Array<{
        key: string;
        label: string;
    }>;
    rows: Array<Record<string, any>>;
}): void;
