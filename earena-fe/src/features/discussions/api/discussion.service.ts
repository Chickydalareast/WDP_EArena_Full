import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import {
    GetQuestionsParams,
    GetQuestionsResponse,
    GetRepliesResponse,
    CreateQuestionDTO,
    CreateReplyDTO,
    GetCourseQuestionsParams,
    DiscussionReply
} from '../types/discussion.schema';

export const discussionService = {

    getQuestions: async (
        lessonId: string,
        params: GetQuestionsParams
    ): Promise<GetQuestionsResponse> => {
        return axiosClient.get<unknown, GetQuestionsResponse>(
            API_ENDPOINTS.DISCUSSIONS.QUESTIONS(lessonId),
            { params }
        );
    },


    getReplies: async (
        parentId: string,
        courseId: string
    ): Promise<DiscussionReply[]> => {
        return axiosClient.get<unknown, DiscussionReply[]>(
            API_ENDPOINTS.DISCUSSIONS.REPLIES(parentId),
            { params: { courseId } }
        );
    },


    postQuestion: async (payload: CreateQuestionDTO): Promise<void> => {
        return axiosClient.post<unknown, void>(
            API_ENDPOINTS.DISCUSSIONS.POST_QUESTION,
            payload
        );
    },


    postReply: async (payload: CreateReplyDTO): Promise<void> => {
        return axiosClient.post<unknown, void>(
            API_ENDPOINTS.DISCUSSIONS.POST_REPLY,
            payload
        );
    },

    getCourseQuestions: async (
        courseId: string,
        params: GetCourseQuestionsParams
    ): Promise<GetQuestionsResponse> => {
        return axiosClient.get<unknown, GetQuestionsResponse>(
            API_ENDPOINTS.DISCUSSIONS.COURSE_QUESTIONS(courseId),
            { params }
        );
    },
};