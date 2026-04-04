import { StudyTreeResponse, ReorderCurriculumPayload, CourseBasic, LessonContentResponse, CreateCourseDTO, CourseTeacherDetail, PublicCourseDetail, UpdateCourseDTO, CourseDashboardStats, TeacherLessonQuizDetail, QuizRulePreviewPayloadDTO, QuizRulePreviewResponse, QuizMatricesResponse, QuizBuilderPreviewPayloadDTO, QuizBuilderPreviewResponse, QuizHealthResponse } from '../types/course.schema';
import { AiBuilderFormDTO, AiBuilderResponse, CreateLessonDTO, CreateQuizLessonDTO, CreateSectionDTO, UpdateLessonDTO, UpdateQuizLessonDTO, UpdateSectionDTO } from '../types/curriculum.schema';
import { CreateQuizLessonResponse } from '@/features/exam-builder/types/exam.schema';
export declare const courseService: {
    getPublicCourses: (params: Record<string, unknown>) => Promise<{
        items: CourseBasic[];
        total: number;
    }>;
    getPublicCourseDetail: (slug: string) => Promise<PublicCourseDetail>;
    getFeaturedCarousel: () => Promise<{
        items: CourseBasic[];
        promoPricePerDay: number;
    }>;
    promoteCourse: (courseId: string, durationDays: 7 | 14 | 30) => Promise<{
        promotionId: string;
        expiresAt: string;
        amountPaid: number;
    }>;
    getStudyTree: (courseId: string) => Promise<StudyTreeResponse>;
    getLessonContent: (courseId: string, lessonId: string) => Promise<LessonContentResponse>;
    markLessonCompleted: (payload: {
        courseId: string;
        lessonId: string;
    }) => Promise<void>;
    enrollCourse: (courseId: string) => Promise<void>;
    getTeacherCourses: () => Promise<CourseBasic[]>;
    getCourseTeacherDetail: (courseId: string) => Promise<CourseTeacherDetail>;
    createCourse: (payload: CreateCourseDTO) => Promise<CourseBasic>;
    updateCourse: (courseId: string, payload: UpdateCourseDTO) => Promise<void>;
    submitForReview: (courseId: string) => Promise<void>;
    publishCourse: (courseId: string) => Promise<void>;
    reorderCurriculum: (courseId: string, payload: ReorderCurriculumPayload) => Promise<void>;
    createSection: (courseId: string, payload: CreateSectionDTO) => Promise<void>;
    updateSection: (courseId: string, sectionId: string, payload: UpdateSectionDTO) => Promise<void>;
    deleteSection: (courseId: string, sectionId: string) => Promise<void>;
    createLesson: (courseId: string, sectionId: string, payload: CreateLessonDTO) => Promise<void>;
    updateLesson: (courseId: string, lessonId: string, payload: UpdateLessonDTO) => Promise<void>;
    deleteLesson: (courseId: string, lessonId: string) => Promise<void>;
    generateAiCurriculum: (courseId: string, payload: AiBuilderFormDTO) => Promise<AiBuilderResponse>;
    sendHeartbeat: (payload: {
        courseId: string;
        lessonId: string;
        delta: number;
        lastPosition: number;
        isEnded?: boolean;
    }) => Promise<void>;
    getCourseDashboardStats: (courseId: string) => Promise<CourseDashboardStats>;
    getCurriculumView: (courseId: string) => Promise<PublicCourseDetail>;
    deleteCourse: (courseId: string) => Promise<any>;
    getTeacherLessonQuizDetail: (courseId: string, lessonId: string) => Promise<TeacherLessonQuizDetail>;
    previewQuizRule: (payload: QuizRulePreviewPayloadDTO) => Promise<QuizRulePreviewResponse>;
    previewQuizConfig: (payload: QuizBuilderPreviewPayloadDTO) => Promise<QuizBuilderPreviewResponse>;
    getQuizMatrices: (params: {
        courseId: string;
        page?: number;
        limit?: number;
        search?: string;
    }) => Promise<QuizMatricesResponse>;
    createQuizLesson: (payload: CreateQuizLessonDTO) => Promise<CreateQuizLessonResponse>;
    updateQuizLesson: (payload: UpdateQuizLessonDTO) => Promise<void>;
    deleteQuizLesson: (courseId: string, lessonId: string) => Promise<void>;
    getQuizHealth: (lessonId: string) => Promise<QuizHealthResponse>;
};
