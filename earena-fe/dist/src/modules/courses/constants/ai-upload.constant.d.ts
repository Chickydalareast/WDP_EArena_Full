export declare const AI_UPLOAD_LIMITS: {
    MAX_FILES: number;
    MAX_FILE_SIZE: number;
};
export declare const AI_ALLOWED_MIME_TYPES: string[];
export declare const aiMulterOptions: {
    limits: {
        fileSize: number;
        files: number;
    };
    fileFilter: (req: any, file: Express.Multer.File, cb: any) => any;
    storage: import("multer").StorageEngine;
};
