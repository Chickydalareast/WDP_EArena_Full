import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { QuestionsRepository } from './questions.repository';
import { QuestionDocument,DifficultyLevel} from './schemas/question.schema';
import { KnowledgeTopicsRepository } from '../taxonomy/knowledge-topics.repository'; 
import { UsersService } from '../users/users.service';

export type CreateQuestionPayload = {
  ownerId: string;
  topicId: string;
  folderId: string;
  difficultyLevel: DifficultyLevel;
  content: string;
  answers: { id: string; content: string; isCorrect: boolean }[];
  isGroup?: boolean;
  parentId?: string;
  tags?: string[];
};
export type UpdateQuestionPayload = Partial<CreateQuestionPayload>;

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

  constructor(
    private readonly questionsRepository: QuestionsRepository,
    private readonly topicsRepo: KnowledgeTopicsRepository, 
    private readonly usersService: UsersService,
  ) {}

  async createQuestion(payload: CreateQuestionPayload): Promise<QuestionDocument> {
    const { ownerId, topicId, folderId, parentId, ...rest } = payload;

    const topic = await this.topicsRepo.findOne({ _id: new Types.ObjectId(topicId) } as any);
    const owner = await this.usersService.findById(ownerId);

    if (!owner) {
      throw new ForbiddenException('Tài khoản không tồn tại hoặc đã bị vô hiệu hóa.');
    }

    const hasPermission = owner.subjectIds?.some(
      (id: Types.ObjectId) => id.toString() === topic.subjectId.toString()
    );

    if (!hasPermission) {
      throw new ForbiddenException('ABAC Block: Bạn không có chuyên môn để tạo câu hỏi cho môn học này.');
    }

    const document = {
      ...rest, 
      ownerId: new Types.ObjectId(ownerId),
      topicId: new Types.ObjectId(topicId),
      folderId: new Types.ObjectId(folderId),
      parentId: parentId ? new Types.ObjectId(parentId) : null,
    };

    return this.questionsRepository.create(document as any);
  }

  async updateQuestion(id: string, ownerId: string, payload: UpdateQuestionPayload): Promise<QuestionDocument> {
    const questionId = new Types.ObjectId(id);
    
    const question = await this.questionsRepository.findOne({ _id: questionId } as any);

    if (question.ownerId.toString() !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa câu hỏi này.');
    }

    const updateData: any = { ...payload };
    if (payload.topicId) updateData.topicId = new Types.ObjectId(payload.topicId);
    if (payload.folderId) updateData.folderId = new Types.ObjectId(payload.folderId);
    if (payload.parentId) updateData.parentId = new Types.ObjectId(payload.parentId);

    return this.questionsRepository.findOneAndUpdate(
      { _id: questionId } as any,
      { $set: updateData } as any
    );
  }

  async cloneQuestion(id: string, currentOwnerId: string, destFolderId: string): Promise<QuestionDocument> {
    const questionId = new Types.ObjectId(id);
    const sourceQuestion = await this.questionsRepository.findOne({ _id: questionId } as any);

    const { _id, createdAt, updatedAt, ...clonedData } = sourceQuestion as any;

    clonedData.ownerId = new Types.ObjectId(currentOwnerId);
    clonedData.folderId = new Types.ObjectId(destFolderId);

    return this.questionsRepository.create(clonedData);
  }
}