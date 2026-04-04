export interface ApiError {
    statusCode: number;
    message: string;
    code?: string;
    details?: any;
}
export declare const parseApiError: (error: any) => ApiError;
