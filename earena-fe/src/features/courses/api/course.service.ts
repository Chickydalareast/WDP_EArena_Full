import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import {
    StudyTreeResponse,
    ReorderCurriculumPayload,
    CourseBasic,
    LessonContentResponse,
    CreateCourseDTO,
    CourseTeacherDetail,
    PublicCourseDetail,
    UpdateCourseDTO,
    CourseDashboardStats,
    TeacherLessonQuizDetail,
    QuizRulePreviewPayloadDTO,
    QuizRulePreviewResponse,
    QuizMatricesResponse,
    QuizBuilderPreviewPayloadDTO,
    QuizBuilderPreviewResponse,
    QuizHealthResponse,
    QuizAttemptsResponse,
    QuizStatsResponse,
    LessonDetailResponse,
    GetTrackingMembersParams,
    PaginatedResponse,
    TrackingMember,
    GetTrackingExamsParams,
    TrackingExamOverview,
    TrackingAttemptDetail,
    GetTrackingAttemptsParams
} from '../types/course.schema';
import { AiBuilderFormDTO, AiBuilderResponse, CreateLessonDTO, CreateQuizLessonDTO, CreateSectionDTO, UpdateLessonDTO, UpdateQuizLessonDTO, UpdateSectionDTO } from '../types/curriculum.schema';
import { CreateExamMatrixDTO, CreateExamMatrixResponse, CreateQuizLessonResponse } from '@/features/exam-builder/types/exam.schema';

export const courseService = {
    getPublicCourses: async (params: Record<string, unknown>): Promise<{ items: CourseBasic[], total: number }> => {
        return axiosClient.get<unknown, { items: CourseBasic[], total: number }>(
            API_ENDPOINTS.COURSES.PUBLIC,
            { params }
        );
    },

    getPublicCourseDetail: async (slug: string): Promise<PublicCourseDetail> => {
        return axiosClient.get<unknown, PublicCourseDetail>(
            API_ENDPOINTS.COURSES.PUBLIC_DETAIL(slug)
        );
    },
    getStudyTree: async (courseId: string): Promise<StudyTreeResponse> => {
        return axiosClient.get<unknown, StudyTreeResponse>(
            API_ENDPOINTS.COURSES.STUDY_TREE(courseId)
        );
    },

    getLessonContent: async (courseId: string, lessonId: string): Promise<LessonContentResponse> => {
        return axiosClient.get<unknown, LessonContentResponse>(
            API_ENDPOINTS.COURSES.LESSON_CONTENT(courseId, lessonId)
        );
    },

    markLessonCompleted: async (payload: { courseId: string; lessonId: string }): Promise<void> => {
        return axiosClient.post<unknown, void>(API_ENDPOINTS.ENROLLMENTS.MARK_COMPLETED, payload);
    },

    enrollCourse: async (courseId: string): Promise<void> => {
        return axiosClient.post<unknown, void>(API_ENDPOINTS.ENROLLMENTS.ENROLL(courseId));
    },

    getTeacherCourses: async (): Promise<CourseBasic[]> => {
        return axiosClient.get<unknown, CourseBasic[]>(API_ENDPOINTS.COURSES.TEACHER_COURSES);
    },

    getCourseTeacherDetail: async (courseId: string): Promise<CourseTeacherDetail> => {
        return axiosClient.get<unknown, CourseTeacherDetail>(API_ENDPOINTS.COURSES.TEACHER_DETAIL(courseId));
    },

    createCourse: async (payload: CreateCourseDTO): Promise<CourseBasic> => {
        return axiosClient.post<unknown, CourseBasic>(API_ENDPOINTS.COURSES.BASE, payload);
    },

    updateCourse: async (courseId: string, payload: UpdateCourseDTO): Promise<void> => {
        return axiosClient.put<unknown, void>(API_ENDPOINTS.COURSES.DETAIL(courseId), payload);
    },

    submitForReview: async (courseId: string): Promise<void> => {
        return axiosClient.patch<unknown, void>(API_ENDPOINTS.COURSES.SUBMIT_REVIEW(courseId));
    },

    publishCourse: async (courseId: string): Promise<void> => {
        return axiosClient.patch<unknown, void>(API_ENDPOINTS.COURSES.PUBLISH(courseId));
    },

    reorderCurriculum: async (courseId: string, payload: ReorderCurriculumPayload): Promise<void> => {
        return axiosClient.patch<unknown, void>(
            API_ENDPOINTS.COURSES.REORDER(courseId),
            payload
        );
    },

    createSection: async (courseId: string, payload: CreateSectionDTO): Promise<void> => {
        return axiosClient.post<unknown, void>(API_ENDPOINTS.COURSES.SECTIONS(courseId), payload);
    },

    updateSection: async (courseId: string, sectionId: string, payload: UpdateSectionDTO): Promise<void> => {
        return axiosClient.put<unknown, void>(`${API_ENDPOINTS.COURSES.SECTIONS(courseId)}/${sectionId}`, payload);
    },

    deleteSection: async (courseId: string, sectionId: string): Promise<void> => {
        return axiosClient.delete<unknown, void>(`${API_ENDPOINTS.COURSES.SECTIONS(courseId)}/${sectionId}`);
    },

    createLesson: async (courseId: string, sectionId: string, payload: CreateLessonDTO): Promise<void> => {
        return axiosClient.post<unknown, void>(API_ENDPOINTS.COURSES.LESSONS(courseId, sectionId), payload);
    },

    updateLesson: async (courseId: string, lessonId: string, payload: UpdateLessonDTO): Promise<void> => {
        return axiosClient.put<unknown, void>(`${API_ENDPOINTS.COURSES.BASE}/${courseId}/lessons/${lessonId}`, payload);
    },

    deleteLesson: async (courseId: string, lessonId: string): Promise<void> => {
        return axiosClient.delete<unknown, void>(`${API_ENDPOINTS.COURSES.BASE}/${courseId}/lessons/${lessonId}`);
    },

    generateAiCurriculum: async (courseId: string, payload: AiBuilderFormDTO): Promise<AiBuilderResponse> => {
        const formData = new FormData();

        payload.files.forEach((file) => {
            formData.append('files', file);
        });

        if (payload.targetSectionCount !== undefined) {
            formData.append('targetSectionCount', payload.targetSectionCount.toString());
        }

        if (payload.additionalInstructions?.trim()) {
            formData.append('additionalInstructions', payload.additionalInstructions.trim());
        }

        return axiosClient.post<unknown, AiBuilderResponse>(
            API_ENDPOINTS.COURSES.AI_GENERATE(courseId),
            formData,
            {
                timeout: 60000,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    },

    sendHeartbeat: async (payload: { courseId: string; lessonId: string; delta: number; lastPosition: number; isEnded?: boolean }): Promise<void> => {
        return axiosClient.post<unknown, void>(API_ENDPOINTS.LEARNING.HEARTBEAT, payload);
    },

    getCourseDashboardStats: async (courseId: string): Promise<CourseDashboardStats> => {
        return axiosClient.get<unknown, CourseDashboardStats>(
            API_ENDPOINTS.COURSES.TEACHER_DASHBOARD_STATS(courseId)
        );
    },

    getCurriculumView: async (courseId: string): Promise<PublicCourseDetail> => {
        return axiosClient.get<unknown, PublicCourseDetail>(
            API_ENDPOINTS.COURSES.TEACHER_CURRICULUM_VIEW(courseId)
        );
    },

    deleteCourse: async (courseId: string): Promise<any> => {
        return axiosClient.delete(API_ENDPOINTS.COURSES.DETAIL(courseId));
    },

    getTeacherLessonQuizDetail: async (
        courseId: string,
        lessonId: string,
    ): Promise<{ data: LessonDetailResponse } | LessonDetailResponse> => {
        return axiosClient.get(
            API_ENDPOINTS.COURSES.LESSON_DETAIL(courseId, lessonId),
        );
    },

    previewQuizRule: async (
        payload: QuizRulePreviewPayloadDTO,
        signal?: AbortSignal
    ): Promise<QuizRulePreviewResponse> => {
        return axiosClient.post<unknown, QuizRulePreviewResponse>(
            API_ENDPOINTS.COURSES.QUIZ_BUILDER_RULE_PREVIEW,
            payload,
            { signal }
        );
    },

    previewQuizConfig: async (
        payload: QuizBuilderPreviewPayloadDTO,
        signal?: AbortSignal
    ): Promise<QuizBuilderPreviewResponse> => {
        return axiosClient.post<unknown, QuizBuilderPreviewResponse>(
            API_ENDPOINTS.COURSES.QUIZ_BUILDER_PREVIEW,
            payload,
            { timeout: 20000, signal }
        );
    },

    // getQuizMatrices: async (params: {
    //     courseId: string;
    //     page?: number;
    //     limit?: number;
    //     search?: string;
    // }): Promise<QuizMatricesResponse> => {
    //     return axiosClient.get<unknown, QuizMatricesResponse>(
    //         API_ENDPOINTS.COURSES.QUIZ_BUILDER_MATRICES,
    //         { params },
    //     );
    // },


    createQuizLesson: async (payload: CreateQuizLessonDTO): Promise<CreateQuizLessonResponse> => {
        return axiosClient.post<unknown, CreateQuizLessonResponse>(
            API_ENDPOINTS.COURSES.QUIZ_BUILDER,
            payload
        );
    },

    updateQuizLesson: async (payload: UpdateQuizLessonDTO): Promise<void> => {
        return axiosClient.put<unknown, void>(
            API_ENDPOINTS.COURSES.QUIZ_BUILDER,
            payload
        );
    },

    deleteQuizLesson: async (courseId: string, lessonId: string): Promise<void> => {
        return axiosClient.delete<unknown, void>(
            API_ENDPOINTS.COURSES.QUIZ_BUILDER,
            { params: { courseId, lessonId } }
        );
    },

    // getQuizHealth: async (lessonId: string): Promise<QuizHealthResponse> => {
    //     return axiosClient.get<unknown, QuizHealthResponse>(
    //         API_ENDPOINTS.COURSES.QUIZ_BUILDER_HEALTH(lessonId)
    //     );
    // },

    getQuizHealth: async (courseId: string, lessonId: string): Promise<QuizHealthResponse> => {
        return axiosClient.get<unknown, QuizHealthResponse>(
            API_ENDPOINTS.COURSES.QUIZ_BUILDER_HEALTH(lessonId),
            {
                params: { courseId }
            }
        );
    },

    getQuizStats: async (
        courseId: string,
        lessonId: string
    ): Promise<QuizStatsResponse> => {
        return axiosClient.get<unknown, QuizStatsResponse>(
            API_ENDPOINTS.COURSES.QUIZ_BUILDER_STATS(lessonId),
            {
                params: { courseId }
            }
        );
    },

    getQuizAttempts: async (
        courseId: string,
        lessonId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<QuizAttemptsResponse> => {
        return axiosClient.get<unknown, QuizAttemptsResponse>(
            API_ENDPOINTS.COURSES.QUIZ_BUILDER_ATTEMPTS(lessonId),
            {
                params: {
                    courseId,
                    page,
                    limit
                }
            }
        );
    },

    getQuizMatrices: async (params: {
        courseId: string;
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<QuizMatricesResponse> => {
        return axiosClient.get<unknown, QuizMatricesResponse>(
            API_ENDPOINTS.EXAM_MATRICES.ROOT, // [CTO FIX]: Trỏ đúng vào Endpoint Global của Exam Matrices
            { params },
        );
    },

    createExamMatrix: async (payload: CreateExamMatrixDTO): Promise<CreateExamMatrixResponse> => {
        return axiosClient.post<unknown, CreateExamMatrixResponse>(
            API_ENDPOINTS.EXAM_MATRICES.ROOT,
            payload
        );
    },

    getExamMatrixDetail: async (id: string): Promise<{ data: any }> => {
        return axiosClient.get(API_ENDPOINTS.EXAM_MATRICES.DETAIL(id));
    },

    getTrackingMembers: async (courseId: string, params: GetTrackingMembersParams): Promise<PaginatedResponse<TrackingMember>> => {
        return axiosClient.get(API_ENDPOINTS.LEARNING.TRACKING_MEMBERS(courseId), { params });
    },

    getTrackingMemberExams: async (courseId: string, studentId: string, params: GetTrackingExamsParams): Promise<PaginatedResponse<TrackingExamOverview>> => {
        return axiosClient.get(API_ENDPOINTS.LEARNING.TRACKING_MEMBER_EXAMS(courseId, studentId), { params });
    },

    getTrackingMemberAttempts: async (courseId: string, studentId: string, lessonId: string, params: GetTrackingAttemptsParams): Promise<PaginatedResponse<TrackingAttemptDetail>> => {
        return axiosClient.get(API_ENDPOINTS.LEARNING.TRACKING_MEMBER_ATTEMPTS(courseId, studentId, lessonId), { params });
    },
};