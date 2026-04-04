export interface StandardizedError {
    code: string;
    message: string;
    status: number;
}
export declare const handleApiError: (error: unknown) => StandardizedError;
