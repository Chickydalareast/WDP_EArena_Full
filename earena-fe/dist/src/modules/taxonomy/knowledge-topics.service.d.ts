import { KnowledgeTopicsRepository } from './knowledge-topics.repository';
import { RedisService } from '../../common/redis/redis.service';
export declare class KnowledgeTopicsService {
    private readonly topicsRepo;
    private readonly redisService;
    private readonly logger;
    constructor(topicsRepo: KnowledgeTopicsRepository, redisService: RedisService);
    getTreeBySubject(subjectId: string): Promise<any>;
}
