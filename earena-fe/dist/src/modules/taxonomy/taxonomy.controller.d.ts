import { SubjectsService } from './subjects.service';
import { KnowledgeTopicsService } from './knowledge-topics.service';
export declare class TaxonomyController {
    private readonly subjectsService;
    private readonly topicsService;
    constructor(subjectsService: SubjectsService, topicsService: KnowledgeTopicsService);
    getAllSubjects(): Promise<any>;
    getMySubjects(userId: string): Promise<any>;
    getTopicTree(subjectId: string): Promise<any>;
}
