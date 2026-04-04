import { Logger } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { ExamPaperDocument, PaperQuestion, PaperAnswerKey } from './schemas/exam-paper.schema';
export declare class ExamPapersRepository extends AbstractRepository<ExamPaperDocument> {
    protected readonly logger: Logger;
    constructor(model: Model<ExamPaperDocument>, connection: Connection);
    findPaperDetailWithRelations(paperId: string | Types.ObjectId): Promise<ExamPaperDocument | null>;
    addQuestionsToPaper(paperId: string | Types.ObjectId, questionsToAdd: PaperQuestion[], answerKeysToAdd: PaperAnswerKey[]): Promise<ExamPaperDocument | null>;
    removeQuestionsFromPaper(paperId: string | Types.ObjectId, questionIdsToRemove: Types.ObjectId[]): Promise<ExamPaperDocument | null>;
}
