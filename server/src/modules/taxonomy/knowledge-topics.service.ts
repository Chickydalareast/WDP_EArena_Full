import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { KnowledgeTopicsRepository } from './knowledge-topics.repository';
import { RedisService } from '../../common/redis/redis.service'; 

@Injectable()
export class KnowledgeTopicsService {
  private readonly logger = new Logger(KnowledgeTopicsService.name);

  constructor(
    private readonly topicsRepo: KnowledgeTopicsRepository,
    private readonly redisService: RedisService,
  ) {}

  async getTreeBySubject(subjectId: string) {
    const cacheKey = `topics_tree:${subjectId}`;

    const cachedTree = await this.redisService.get(cacheKey);
    if (cachedTree) {
      this.logger.log(`[Cache Hit] Lấy cây kiến thức từ Redis: ${subjectId}`);
      return JSON.parse(cachedTree);
    }

    const flatList = await (this.topicsRepo as any).model
      .find({ subjectId: new Types.ObjectId(subjectId) })
      .lean()
      .exec();

    const map = new Map<string, any>();
    const tree: any[] = []; 
    flatList.forEach((node: any) => {
      map.set(node._id.toString(), { ...node, children: [] });
    });

    flatList.forEach((node: any) => {
      map.set(node._id.toString(), { ...node, children: [] });
    });

    flatList.forEach((node: any) => {
      if (node.parentId) {
        const parent = map.get(node.parentId.toString());
        if (parent) {
          parent.children.push(map.get(node._id.toString()));
        }
      } else {
        tree.push(map.get(node._id.toString()));
      }
    });

    await this.redisService.set(cacheKey, JSON.stringify(tree), 86400 * 30);
    this.logger.log(`[Cache Miss] Đã build cây và lưu Redis: ${subjectId}`);

    return tree;
  }
}