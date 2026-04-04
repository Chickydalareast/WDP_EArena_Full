import { FetchBankQuestionsParams } from '../types/question-bank.schema';
export declare const BANK_QUESTIONS_KEY: string[];
export declare const SUGGEST_FOLDERS_KEY: string[];
export declare const useFolderTree: () => any;
export declare const useBankQuestions: (params: FetchBankQuestionsParams, isPollingActive?: boolean) => any;
export declare const useBulkMoveQuestions: () => any;
