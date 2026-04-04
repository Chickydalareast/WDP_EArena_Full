import { QuestionFoldersService } from './question-folders.service';
import { CreateQuestionFolderDto } from './dto/create-question-folder.dto';
import { UpdateQuestionFolderDto } from './dto/update-question-folder.dto';
export declare class QuestionFoldersController {
    private readonly questionFoldersService;
    constructor(questionFoldersService: QuestionFoldersService);
    createFolder(userId: string, dto: CreateQuestionFolderDto): Promise<import("./schemas/question-folder.schema").QuestionFolderDocument>;
    getMyFolders(userId: string): Promise<any[]>;
    updateFolder(folderId: string, userId: string, dto: UpdateQuestionFolderDto): Promise<{
        message: string;
    }>;
    deleteFolder(folderId: string, userId: string): Promise<{
        message: string;
    }>;
}
