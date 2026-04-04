"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var QuestionsRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const abstract_repository_1 = require("../../common/database/abstract.repository");
const question_schema_1 = require("./schemas/question.schema");
let QuestionsRepository = QuestionsRepository_1 = class QuestionsRepository extends abstract_repository_1.AbstractRepository {
    questionModel;
    logger = new common_1.Logger(QuestionsRepository_1.name);
    constructor(questionModel, connection) {
        super(questionModel, connection);
        this.questionModel = questionModel;
    }
    async getRandomQuestions(folderIds, topicId, difficulty, limit) {
        const objectIdFolders = folderIds.map((id) => new mongoose_2.Types.ObjectId(id));
        return this.questionModel
            .aggregate([
            {
                $match: {
                    folderId: { $in: objectIdFolders },
                    topicId: new mongoose_2.Types.ObjectId(topicId),
                    difficultyLevel: difficulty,
                    isArchived: false,
                    isDraft: false,
                    parentPassageId: null,
                },
            },
            { $sample: { size: limit } },
            {
                $project: {
                    ownerId: 0,
                    isArchived: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                },
            },
        ])
            .exec();
    }
    async getQuestionsPaginated(ownerId, filter) {
        const { page, limit, folderIds, topicIds, difficultyLevels, tags, search, isDraft, } = filter;
        const skip = (page - 1) * limit;
        const matchStage = {
            ownerId: new mongoose_2.Types.ObjectId(ownerId),
            isArchived: false,
            parentPassageId: null,
        };
        if (folderIds && folderIds.length > 0) {
            matchStage.folderId = {
                $in: folderIds.map((id) => new mongoose_2.Types.ObjectId(id)),
            };
        }
        if (topicIds && topicIds.length > 0) {
            matchStage.topicId = {
                $in: topicIds.map((id) => new mongoose_2.Types.ObjectId(id)),
            };
        }
        if (difficultyLevels && difficultyLevels.length > 0) {
            matchStage.difficultyLevel = { $in: difficultyLevels };
        }
        if (tags && tags.length > 0) {
            matchStage.tags = { $in: tags };
        }
        if (search)
            matchStage.content = { $regex: search, $options: 'i' };
        if (typeof isDraft === 'boolean')
            matchStage.isDraft = isDraft;
        const [result] = await this.questionModel
            .aggregate([
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        { $project: { __v: 0 } },
                    ],
                    totalCount: [{ $count: 'count' }],
                },
            },
        ])
            .exec();
        let parents = result.data || [];
        const total = result.totalCount[0]?.count || 0;
        if (parents.length === 0) {
            return { items: [], meta: { total: 0, page, limit, totalPages: 0 } };
        }
        parents = await this.questionModel.populate(parents, {
            path: 'attachedMedia',
            select: 'url mimetype provider originalName _id',
        });
        const passageIds = parents
            .filter((p) => p.type === question_schema_1.QuestionType.PASSAGE)
            .map((p) => p._id);
        let children = [];
        if (passageIds.length > 0) {
            children = await this.questionModel
                .find({
                parentPassageId: { $in: passageIds },
                isArchived: false,
            })
                .sort({ orderIndex: 1 })
                .select('-__v')
                .lean();
            children = await this.questionModel.populate(children, {
                path: 'attachedMedia',
                select: 'url mimetype provider originalName _id',
            });
        }
        const childrenMap = new Map();
        for (const child of children) {
            const parentIdStr = child.parentPassageId.toString();
            if (!childrenMap.has(parentIdStr)) {
                childrenMap.set(parentIdStr, []);
            }
            childrenMap.get(parentIdStr).push(child);
        }
        const items = parents.map((parent) => {
            if (parent.type === question_schema_1.QuestionType.PASSAGE) {
                parent.subQuestions = childrenMap.get(parent._id.toString()) || [];
            }
            return parent;
        });
        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findSubQuestionsByPassageId(passageIds) {
        if (!passageIds || passageIds.length === 0)
            return [];
        return this.model
            .find({
            parentPassageId: { $in: passageIds },
            isDraft: false,
        })
            .sort({ orderIndex: 1 })
            .populate({
            path: 'attachedMedia',
            select: 'url mimetype provider originalName _id',
        })
            .lean()
            .exec();
    }
    async generateDynamicQuestions(dynamicConfig, optionalTopicId) {
        const { sourceFolders, mixRatio } = dynamicConfig;
        const folderObjIds = sourceFolders.map((id) => new mongoose_2.Types.ObjectId(id));
        const rootQuestions = [];
        for (const ratio of mixRatio) {
            const matchStage = {
                folderId: { $in: folderObjIds },
                difficultyLevel: ratio.difficulty,
                isArchived: false,
                isDraft: false,
                parentPassageId: null,
            };
            if (optionalTopicId) {
                matchStage.topicId = new mongoose_2.Types.ObjectId(optionalTopicId);
            }
            const sampled = await this.model
                .aggregate([{ $match: matchStage }, { $sample: { size: ratio.count } }])
                .exec();
            rootQuestions.push(...sampled);
        }
        const passageIds = rootQuestions
            .filter((q) => q.type === question_schema_1.QuestionType.PASSAGE)
            .map((q) => q._id);
        let subQuestions = [];
        if (passageIds.length > 0) {
            subQuestions = await this.findSubQuestionsByPassageId(passageIds);
        }
        const finalQuestions = [];
        const answerKeys = [];
        const allRawQuestions = [...rootQuestions, ...subQuestions];
        for (const q of allRawQuestions) {
            const correctAns = q.answers.find((a) => a.isCorrect);
            finalQuestions.push({
                originalQuestionId: q._id,
                type: q.type,
                parentPassageId: q.parentPassageId || null,
                orderIndex: q.orderIndex || 0,
                content: q.content,
                explanation: q.explanation || null,
                difficultyLevel: q.difficultyLevel,
                answers: q.answers.map((a) => ({ id: a.id, content: a.content })),
                attachedMedia: q.attachedMedia || [],
                points: null,
            });
            if (correctAns) {
                answerKeys.push({
                    originalQuestionId: q._id,
                    correctAnswerId: correctAns.id,
                });
            }
        }
        return { questions: finalQuestions, answerKeys };
    }
    async countValidQuestions(questionIds, ownerId) {
        const objectIds = questionIds.map((id) => new mongoose_2.Types.ObjectId(id));
        return this.model
            .countDocuments({
            _id: { $in: objectIds },
            ownerId: new mongoose_2.Types.ObjectId(ownerId),
            isArchived: false,
        })
            .exec();
    }
    async getCandidatePoolForRule(ownerId, rule, excludeIds, poolSizeMultiplier = 3) {
        const baseMatch = {
            ownerId,
            isArchived: false,
            isDraft: false,
            parentPassageId: null,
            _id: { $nin: excludeIds },
        };
        if (rule.folderIds?.length)
            baseMatch.folderId = { $in: rule.folderIds };
        if (rule.topicIds?.length)
            baseMatch.topicId = { $in: rule.topicIds };
        const poolLimit = rule.limit * poolSizeMultiplier;
        const flatMatch = { ...baseMatch, type: { $ne: question_schema_1.QuestionType.PASSAGE } };
        if (rule.difficulties?.length)
            flatMatch.difficultyLevel = { $in: rule.difficulties };
        if (rule.tags?.length)
            flatMatch.tags = { $in: rule.tags };
        const passageMatch = { ...baseMatch, type: question_schema_1.QuestionType.PASSAGE };
        const ruleAndConditions = [];
        if (rule.difficulties?.length) {
            ruleAndConditions.push({
                $or: [
                    { difficultyLevel: { $in: rule.difficulties } },
                    { 'children.difficultyLevel': { $in: rule.difficulties } }
                ]
            });
        }
        if (rule.tags?.length) {
            ruleAndConditions.push({
                $or: [
                    { tags: { $in: rule.tags } },
                    { 'children.tags': { $in: rule.tags } }
                ]
            });
        }
        const passageRuleMatch = ruleAndConditions.length > 0 ? { $and: ruleAndConditions } : {};
        const [flats, passagesRaw] = await Promise.all([
            this.model
                .aggregate([
                { $match: flatMatch },
                { $sample: { size: poolLimit } },
                { $project: { __v: 0, createdAt: 0, updatedAt: 0, ownerId: 0 } },
            ])
                .exec(),
            this.model
                .aggregate([
                { $match: passageMatch },
                {
                    $lookup: {
                        from: 'questions',
                        localField: '_id',
                        foreignField: 'parentPassageId',
                        pipeline: [
                            { $match: { isArchived: false, isDraft: false } },
                            { $sort: { orderIndex: 1 } },
                            { $project: { __v: 0, createdAt: 0, updatedAt: 0, ownerId: 0 } },
                        ],
                        as: 'children',
                    },
                },
                { $match: { 'children.0': { $exists: true } } },
                ...(Object.keys(passageRuleMatch).length > 0 ? [{ $match: passageRuleMatch }] : []),
                { $sample: { size: poolLimit } },
                { $project: { __v: 0, createdAt: 0, updatedAt: 0, ownerId: 0 } },
            ])
                .exec(),
        ]);
        return { flats, passages: passagesRaw };
    }
    async countAvailableQuestionsForRule(ownerId, rule, excludeIds) {
        const baseMatch = {
            ownerId,
            isArchived: false,
            isDraft: false,
            parentPassageId: null,
            _id: { $nin: excludeIds },
        };
        if (rule.folderIds?.length)
            baseMatch.folderId = { $in: rule.folderIds };
        if (rule.topicIds?.length)
            baseMatch.topicId = { $in: rule.topicIds };
        const flatMatch = { ...baseMatch, type: { $ne: question_schema_1.QuestionType.PASSAGE } };
        if (rule.difficulties?.length)
            flatMatch.difficultyLevel = { $in: rule.difficulties };
        if (rule.tags?.length)
            flatMatch.tags = { $in: rule.tags };
        const flatsPipeline = [
            { $match: flatMatch },
            { $count: 'total' }
        ];
        const passageMatch = { ...baseMatch, type: question_schema_1.QuestionType.PASSAGE };
        const ruleAndConditions = [];
        if (rule.difficulties?.length) {
            ruleAndConditions.push({
                $or: [
                    { difficultyLevel: { $in: rule.difficulties } },
                    { 'children.difficultyLevel': { $in: rule.difficulties } }
                ]
            });
        }
        if (rule.tags?.length) {
            ruleAndConditions.push({
                $or: [
                    { tags: { $in: rule.tags } },
                    { 'children.tags': { $in: rule.tags } }
                ]
            });
        }
        const passageRuleMatch = ruleAndConditions.length > 0 ? { $and: ruleAndConditions } : {};
        const passagesPipeline = [
            { $match: passageMatch },
            {
                $lookup: {
                    from: 'questions',
                    localField: '_id',
                    foreignField: 'parentPassageId',
                    pipeline: [
                        { $match: { isArchived: false, isDraft: false } },
                        { $project: { _id: 1, difficultyLevel: 1, tags: 1 } },
                    ],
                    as: 'children',
                },
            },
            { $match: { 'children.0': { $exists: true } } },
            ...(Object.keys(passageRuleMatch).length > 0 ? [{ $match: passageRuleMatch }] : []),
            {
                $project: {
                    countContribution: { $size: '$children' }
                },
            },
            {
                $group: {
                    _id: null,
                    totalAvailable: { $sum: '$countContribution' },
                },
            },
        ];
        const [flatsResult, passagesResult] = await Promise.all([
            this.model.aggregate(flatsPipeline).exec(),
            this.model.aggregate(passagesPipeline).exec(),
        ]);
        const flatCount = flatsResult[0]?.total || 0;
        const passageCount = passagesResult[0]?.totalAvailable || 0;
        return flatCount + passageCount;
    }
    async getActiveFiltersMetadata(ownerId, filters) {
        const globalMatch = {
            ownerId: new mongoose_2.Types.ObjectId(ownerId),
            isArchived: false,
            parentPassageId: null,
        };
        if (typeof filters.isDraft === 'boolean') {
            globalMatch.isDraft = filters.isDraft;
        }
        const folderMatch = filters.folderIds?.length
            ? {
                folderId: {
                    $in: filters.folderIds.map((id) => new mongoose_2.Types.ObjectId(id)),
                },
            }
            : {};
        const topicMatch = filters.topicIds?.length
            ? {
                topicId: {
                    $in: filters.topicIds.map((id) => new mongoose_2.Types.ObjectId(id)),
                },
            }
            : {};
        const diffMatch = filters.difficulties?.length
            ? { difficultyLevel: { $in: filters.difficulties } }
            : {};
        const tagMatch = filters.tags?.length
            ? { tags: { $in: filters.tags } }
            : {};
        const [result] = await this.model
            .aggregate([
            { $match: globalMatch },
            {
                $facet: {
                    folders: [
                        { $match: { ...topicMatch, ...diffMatch, ...tagMatch } },
                        { $group: { _id: '$folderId' } },
                        { $match: { _id: { $ne: null } } },
                        { $project: { _id: 0, id: { $toString: '$_id' } } },
                    ],
                    topics: [
                        { $match: { ...folderMatch, ...diffMatch, ...tagMatch } },
                        { $group: { _id: '$topicId' } },
                        { $match: { _id: { $ne: null } } },
                        { $project: { _id: 0, id: { $toString: '$_id' } } },
                    ],
                    difficulties: [
                        { $match: { ...folderMatch, ...topicMatch, ...tagMatch } },
                        { $group: { _id: '$difficultyLevel' } },
                        { $match: { _id: { $ne: null } } },
                        { $project: { _id: 0, id: '$_id' } },
                    ],
                    tags: [
                        { $match: { ...folderMatch, ...topicMatch, ...diffMatch } },
                        { $unwind: '$tags' },
                        { $group: { _id: '$tags' } },
                        { $match: { _id: { $ne: null } } },
                        { $project: { _id: 0, id: '$_id' } },
                    ],
                },
            },
        ])
            .exec();
        return {
            folderIds: result?.folders.map((f) => f.id) || [],
            topicIds: result?.topics.map((t) => t.id) || [],
            difficulties: result?.difficulties.map((d) => d.id) || [],
            tags: result?.tags.map((t) => t.id) || [],
        };
    }
    async getPublishedActiveFiltersMetadata(ownerId, filters) {
        const globalMatch = {
            ownerId: new mongoose_2.Types.ObjectId(ownerId),
            isArchived: false,
            isDraft: false,
            parentPassageId: null,
        };
        const folderMatch = filters.folderIds?.length
            ? {
                folderId: {
                    $in: filters.folderIds.map((id) => new mongoose_2.Types.ObjectId(id)),
                },
            }
            : {};
        const topicMatch = filters.topicIds?.length
            ? {
                topicId: {
                    $in: filters.topicIds.map((id) => new mongoose_2.Types.ObjectId(id)),
                },
            }
            : {};
        const diffMatch = filters.difficulties?.length
            ? { difficultyLevel: { $in: filters.difficulties } }
            : {};
        const tagMatch = filters.tags?.length
            ? { tags: { $in: filters.tags } }
            : {};
        const [result] = await this.model
            .aggregate([
            { $match: globalMatch },
            {
                $facet: {
                    folders: [
                        { $match: { ...topicMatch, ...diffMatch, ...tagMatch } },
                        { $group: { _id: '$folderId' } },
                        { $match: { _id: { $ne: null } } },
                        { $project: { _id: 0, id: { $toString: '$_id' } } },
                    ],
                    topics: [
                        { $match: { ...folderMatch, ...diffMatch, ...tagMatch } },
                        { $group: { _id: '$topicId' } },
                        { $match: { _id: { $ne: null } } },
                        { $project: { _id: 0, id: { $toString: '$_id' } } },
                    ],
                    difficulties: [
                        { $match: { ...folderMatch, ...topicMatch, ...tagMatch } },
                        { $group: { _id: '$difficultyLevel' } },
                        { $match: { _id: { $ne: null } } },
                        { $project: { _id: 0, id: '$_id' } },
                    ],
                    tags: [
                        { $match: { ...folderMatch, ...topicMatch, ...diffMatch } },
                        { $unwind: '$tags' },
                        { $group: { _id: '$tags' } },
                        { $match: { _id: { $ne: null } } },
                        { $project: { _id: 0, id: '$_id' } },
                    ],
                },
            },
        ])
            .exec();
        return {
            folderIds: result?.folders.map((f) => f.id) || [],
            topicIds: result?.topics.map((t) => t.id) || [],
            difficulties: result?.difficulties.map((d) => d.id) || [],
            tags: result?.tags.map((t) => t.id) || [],
        };
    }
};
exports.QuestionsRepository = QuestionsRepository;
exports.QuestionsRepository = QuestionsRepository = QuestionsRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(question_schema_1.Question.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection])
], QuestionsRepository);
//# sourceMappingURL=questions.repository.js.map