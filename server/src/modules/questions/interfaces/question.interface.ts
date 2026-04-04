import { RuleQuestionType } from 'src/modules/exams/interfaces/exam-matrix.interface';
import { DifficultyLevel } from '../schemas/question.schema';
import { QuestionType } from '../schemas/question.schema';

export interface AnswerOptionPayload {
  id: string;
  content: string;
  isCorrect: boolean;
}

export interface CreateQuestionPayload {
  ownerId: string;
  folderId: string;
  topicId?: string;
  type: QuestionType;
  difficultyLevel?: DifficultyLevel;
  content: string;
  explanation?: string;
  orderIndex?: number;
  answers?: AnswerOptionPayload[];
  parentPassageId?: string;
  tags?: string[];
  isDraft?: boolean;
  attachedMedia?: string[];
}

export interface BulkSubQuestionPayload {
  content: string;
  explanation?: string;
  difficultyLevel?: DifficultyLevel;
  answers: AnswerOptionPayload[];
  attachedMedia?: string[];
}

export interface BulkQuestionItemPayload {
  type: QuestionType;
  content: string;
  explanation?: string;
  difficultyLevel?: DifficultyLevel;
  tags?: string[];
  answers?: AnswerOptionPayload[];
  subQuestions?: BulkSubQuestionPayload[];
  attachedMedia?: string[];

  topicId?: string;
  isDraft?: boolean;
}

export interface BulkCreateQuestionPayload {
  ownerId: string;
  folderId: string;
  questions: BulkQuestionItemPayload[];
}

export interface UpdatePassageSubQuestionPayload {
  id?: string;
  content: string;
  explanation?: string;
  difficultyLevel?: DifficultyLevel;
  answers: AnswerOptionPayload[];
  attachedMedia?: string[];
}

export interface UpdatePassagePayload {
  content?: string;
  explanation?: string;
  topicId?: string;
  difficultyLevel?: DifficultyLevel;
  tags?: string[];
  attachedMedia?: string[];
  subQuestions: UpdatePassageSubQuestionPayload[];
  isDraft?: boolean;
}

export enum QuestionSyncAction {
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface QuestionSyncJobData {
  action: QuestionSyncAction;
  questionId: string;
}

export interface CloneQuestionPayload {
  destFolderId: string;
}

export interface BulkCloneQuestionPayload {
  questionIds: string[];
  destFolderId: string;
}

export interface BulkDeleteQuestionPayload {
  questionIds: string[];
}

export interface QuestionFilterPayload {
  page: number;
  limit: number;
  folderIds?: string[];
  topicIds?: string[];
  difficultyLevels?: DifficultyLevel[];
  tags?: string[];
  search?: string;
  isDraft?: boolean;
}
export interface BulkStandardizeQuestionPayload {
  questionIds: string[];
  topicId: string;
  difficultyLevel: DifficultyLevel;
  autoOrganize?: boolean;
}

export interface SuggestFolderPayload {
  questionIds: string[];
}

export interface GetActiveFiltersPayload {
  folderIds?: string[];
  topicIds?: string[];
  difficulties?: DifficultyLevel[];
  tags?: string[];
  isDraft?: boolean;
  questionType?: RuleQuestionType;
}

export interface PrunedTreeNode {
  id: string;
  name: string;
  children: PrunedTreeNode[];
}

export interface ActiveFiltersResponse {
  folders: PrunedTreeNode[];
  topics: PrunedTreeNode[];
  difficulties: string[];
  tags: string[];
}

export interface BulkPublishQuestionPayload {
  questionIds: string[];
}
