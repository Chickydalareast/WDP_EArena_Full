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
var ClassMembersRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassMembersRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const abstract_repository_1 = require("../../common/database/abstract.repository");
const class_member_schema_1 = require("./schemas/class-member.schema");
let ClassMembersRepository = ClassMembersRepository_1 = class ClassMembersRepository extends abstract_repository_1.AbstractRepository {
    memberModel;
    logger = new common_1.Logger(ClassMembersRepository_1.name);
    constructor(memberModel, connection) {
        super(memberModel, connection);
        this.memberModel = memberModel;
    }
    async findExistingMember(classId, studentId) {
        return this.memberModel.findOne({
            classId: new mongoose_2.Types.ObjectId(classId),
            studentId: new mongoose_2.Types.ObjectId(studentId),
        }).lean().exec();
    }
    async findMembersWithDetails(classId, status) {
        const query = { classId: new mongoose_2.Types.ObjectId(classId) };
        if (status) {
            query.status = status;
        }
        return this.memberModel
            .find(query)
            .populate('studentId', 'fullName email avatar')
            .select('studentId status createdAt')
            .sort({ createdAt: 1 })
            .lean()
            .exec();
    }
    async findMembersWithDetailsPaginated(classId, queryDto) {
        const { status } = queryDto;
        const page = Number(queryDto.page) || 1;
        const limit = Number(queryDto.limit) || 20;
        const query = { classId: new mongoose_2.Types.ObjectId(classId) };
        if (status)
            query.status = status;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.memberModel
                .find(query)
                .populate('studentId', 'fullName email avatar')
                .select('studentId status createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.memberModel.countDocuments(query).exec()
        ]);
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getJoinedClassesPaginated(studentId, page, limit) {
        const skip = (page - 1) * limit;
        const pipeline = [
            {
                $match: {
                    studentId: new mongoose_2.Types.ObjectId(studentId),
                    status: class_member_schema_1.JoinStatus.APPROVED
                }
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classId',
                    foreignField: '_id',
                    as: 'classDetail'
                }
            },
            { $unwind: '$classDetail' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'classDetail.teacherId',
                    foreignField: '_id',
                    as: 'teacherDetail'
                }
            },
            { $unwind: { path: '$teacherDetail', preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 0,
                                id: { $toString: '$classDetail._id' },
                                name: '$classDetail.name',
                                coverImageId: { $toString: '$classDetail.coverImageId' },
                                isLocked: '$classDetail.isLocked',
                                joinedAt: '$createdAt',
                                teacher: {
                                    id: { $toString: '$teacherDetail._id' },
                                    fullName: '$teacherDetail.fullName',
                                    avatar: '$teacherDetail.avatar'
                                }
                            }
                        }
                    ]
                }
            }
        ];
        const result = await this.memberModel.aggregate(pipeline).exec();
        const total = result[0]?.metadata[0]?.total || 0;
        const data = result[0]?.data || [];
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getStudentWorkspaceData(classId, studentId) {
        const pipeline = [
            {
                $match: {
                    classId: new mongoose_2.Types.ObjectId(classId),
                    studentId: new mongoose_2.Types.ObjectId(studentId),
                    status: class_member_schema_1.JoinStatus.APPROVED
                }
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classId',
                    foreignField: '_id',
                    as: 'classDetail'
                }
            },
            { $unwind: '$classDetail' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'classDetail.teacherId',
                    foreignField: '_id',
                    as: 'teacherDetail'
                }
            },
            { $unwind: { path: '$teacherDetail', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'exam_assignments',
                    let: { cId: '$classId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$classId', '$$cId'] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 5 },
                        {
                            $project: {
                                _id: 0,
                                id: { $toString: '$_id' },
                                examId: { $toString: '$examId' },
                                startTime: 1,
                                endTime: 1,
                                timeLimit: 1
                            }
                        }
                    ],
                    as: 'recentAssignments'
                }
            },
            {
                $project: {
                    _id: 0,
                    id: { $toString: '$classDetail._id' },
                    name: '$classDetail.name',
                    description: '$classDetail.description',
                    coverImageId: { $toString: '$classDetail.coverImageId' },
                    joinedAt: '$createdAt',
                    teacher: {
                        id: { $toString: '$teacherDetail._id' },
                        fullName: '$teacherDetail.fullName',
                        avatar: '$teacherDetail.avatar'
                    },
                    recentAssignments: 1
                }
            }
        ];
        const result = await this.memberModel.aggregate(pipeline).exec();
        return result[0] || null;
    }
    async updateMemberStatus(classId, studentId, status) {
        return this.memberModel.findOneAndUpdate({
            classId: new mongoose_2.Types.ObjectId(classId),
            studentId: new mongoose_2.Types.ObjectId(studentId)
        }, { $set: { status } }, { returnDocument: 'after', lean: true }).exec();
    }
};
exports.ClassMembersRepository = ClassMembersRepository;
exports.ClassMembersRepository = ClassMembersRepository = ClassMembersRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(class_member_schema_1.ClassMember.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection])
], ClassMembersRepository);
//# sourceMappingURL=class-members.repository.js.map