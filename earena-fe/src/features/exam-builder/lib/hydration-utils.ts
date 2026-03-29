import { EditQuestionFormDTO, EditSubQuestionDTO, AnswerOptionDTO } from '../types/exam.schema';

export interface PopulatedMedia {
    _id: string;
    url: string;
    mimetype: string;
    originalName: string;
}

export interface PopulatedAnswer {
    id: string;
    content: string;
    isCorrect?: boolean;
}

export interface PopulatedSubQuestion {
    _id: string;
    originalQuestionId: string;
    content: string;
    difficultyLevel?: 'NB' | 'TH' | 'VD' | 'VDC' | 'UNKNOWN';
    attachedMedia?: PopulatedMedia[];
    answers?: PopulatedAnswer[];
}

export interface PopulatedQuestion {
    _id: string;
    originalQuestionId: string;
    type: 'MULTIPLE_CHOICE' | 'PASSAGE';
    content: string;
    difficultyLevel?: 'NB' | 'TH' | 'VD' | 'VDC' | 'UNKNOWN';
    attachedMedia?: PopulatedMedia[];
    answers?: PopulatedAnswer[];
    subQuestions?: PopulatedSubQuestion[];
}

export interface AnswerKey {
    originalQuestionId: string;
    correctAnswerId: string;
}

const mapAnswersWithKeys = (
    answers: PopulatedAnswer[] = [],
    questionId: string,
    answerKeys?: AnswerKey[]
): AnswerOptionDTO[] => {

    if (!answers || answers.length === 0) {
        return [
            { id: 'A', content: '', isCorrect: true },
            { id: 'B', content: '', isCorrect: false },
            { id: 'C', content: '', isCorrect: false },
            { id: 'D', content: '', isCorrect: false },
        ];
    }

    if (answerKeys && answerKeys.length > 0) {
        const keyObj = answerKeys.find((k) => k.originalQuestionId === questionId);
        const correctId = keyObj?.correctAnswerId;
        return answers.map((ans) => ({
            id: ans.id,
            content: ans.content,
            isCorrect: ans.id === correctId,
        }));
    }
    return answers.map((ans) => ({
        id: ans.id,
        content: ans.content,
        isCorrect: !!ans.isCorrect,
    }));
};

const extractMediaIds = (mediaList?: PopulatedMedia[]): string[] => {
    if (!mediaList || !Array.isArray(mediaList)) return [];
    return mediaList.map((m) => m._id);
};

export const hydrateQuestionForEdit = (
    question: PopulatedQuestion,
    answerKeys?: AnswerKey[]
): EditQuestionFormDTO => {

    const baseDTO: Partial<EditQuestionFormDTO> = {
        _id: question._id,
        type: question.type,
        content: question.content || '',
        difficultyLevel: question.difficultyLevel || 'UNKNOWN',
        attachedMedia: extractMediaIds(question.attachedMedia),
    };

    if (question.type === 'PASSAGE') {
        const subQuestionsDTO: EditSubQuestionDTO[] = (question.subQuestions || []).map((subQ) => ({
            _id: subQ._id,
            content: subQ.content || '',
            difficultyLevel: subQ.difficultyLevel || 'UNKNOWN',
            attachedMedia: extractMediaIds(subQ.attachedMedia),
            answers: mapAnswersWithKeys(subQ.answers, subQ._id || subQ.originalQuestionId, answerKeys),
        }));

        if (subQuestionsDTO.length === 0) {
            subQuestionsDTO.push({
                content: '',
                difficultyLevel: 'UNKNOWN',
                attachedMedia: [],
                answers: mapAnswersWithKeys([], 'fallback_id'),
            });
        }

        return {
            ...baseDTO,
            type: 'PASSAGE',
            subQuestions: subQuestionsDTO,
        } as EditQuestionFormDTO;
    }

    return {
        ...baseDTO,
        type: 'MULTIPLE_CHOICE',
        answers: mapAnswersWithKeys(question.answers, question._id || question.originalQuestionId, answerKeys),
    } as EditQuestionFormDTO;
};