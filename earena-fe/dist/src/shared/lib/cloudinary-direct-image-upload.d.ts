export type CloudinaryMediaContextParam = 'avatar' | 'general' | 'question' | 'course_thumbnail' | 'lesson_document' | 'lesson_video';
export declare function uploadImageDirectToCloudinary(file: File, context: CloudinaryMediaContextParam): Promise<{
    url: string;
}>;
