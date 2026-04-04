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
var ClassesRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const abstract_repository_1 = require("../../common/database/abstract.repository");
const class_schema_1 = require("./schemas/class.schema");
const class_member_schema_1 = require("./schemas/class-member.schema");
let ClassesRepository = ClassesRepository_1 = class ClassesRepository extends abstract_repository_1.AbstractRepository {
    classModel;
    logger = new common_1.Logger(ClassesRepository_1.name);
    constructor(classModel, connection) {
        super(classModel, connection);
        this.classModel = classModel;
    }
    async searchPublicClasses(query) {
        const { keyword, page = 1, limit = 20 } = query;
        const filter = { isPublic: true, isLocked: false };
        if (keyword) {
            filter.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { code: keyword.toUpperCase() },
            ];
        }
        const skip = (page - 1) * limit;
        return this.classModel
            .find(filter)
            .select('name description code teacherId coverImageUrl')
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();
    }
    async findByCode(code) {
        return this.classModel.findOne({ code: code.toUpperCase() }).lean().exec();
    }
    async getClassPreview(classId) {
        const data = await this.classModel
            .findById(classId)
            .select('name description code coverImageUrl isPublic isLocked createdAt teacherId')
            .populate('teacherId', 'fullName avatar email')
            .lean()
            .exec();
        if (!data)
            return null;
        const { _id, ...rest } = data;
        return { id: _id.toString(), ...rest };
    }
    async findClassesByTeacher(teacherId, limit = 50) {
        const classes = await this.classModel
            .find({ teacherId: new mongoose_2.Types.ObjectId(teacherId) })
            .select('name description code coverImageUrl isPublic isLocked createdAt')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();
        return classes.map((cls) => {
            const { _id, ...rest } = cls;
            return {
                id: _id.toString(),
                ...rest,
            };
        });
    }
    async searchPaginatedPublicClasses(query) {
        const { keyword, page = 1, limit = 20 } = query;
        const filter = { isPublic: true, isLocked: false };
        if (keyword) {
            filter.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { code: keyword.toUpperCase() },
            ];
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.classModel
                .find(filter)
                .select('name description teacherId coverImageUrl isPublic isLocked createdAt')
                .populate('teacherId', 'fullName avatar')
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.classModel.countDocuments(filter).exec()
        ]);
        const mappedData = data.map((item) => {
            const { _id, teacherId, ...rest } = item;
            return {
                id: _id.toString(),
                teacher: teacherId ? { id: teacherId._id.toString(), fullName: teacherId.fullName, avatar: teacherId.avatar } : null,
                ...rest
            };
        });
        return {
            data: mappedData,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getTeacherClassesWithMetrics(teacherId) {
        const pipeline = [
            { $match: { teacherId: new mongoose_2.Types.ObjectId(teacherId) } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'class_members',
                    let: { classId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$classId', '$$classId'] },
                                status: class_member_schema_1.JoinStatus.APPROVED
                            }
                        }
                    ],
                    as: 'approvedMembers'
                }
            },
            {
                $lookup: {
                    from: 'class_members',
                    let: { classId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$classId', '$$classId'] },
                                status: 'PENDING'
                            }
                        }
                    ],
                    as: 'pendingMembers'
                }
            },
            {
                $project: {
                    id: { $toString: '$_id' },
                    _id: 0,
                    name: 1,
                    code: 1,
                    description: 1,
                    coverImageUrl: 1,
                    isPublic: 1,
                    isLocked: 1,
                    createdAt: 1,
                    studentCount: { $size: '$approvedMembers' },
                    pendingCount: { $size: '$pendingMembers' }
                }
            }
        ];
        return this.classModel.aggregate(pipeline).exec();
    }
    async getClassAdminDetails(classId) {
        const pipeline = [
            { $match: { _id: new mongoose_2.Types.ObjectId(classId) } },
            {
                $lookup: {
                    from: 'class_members',
                    let: { cId: '$_id' },
                    pipeline: [{ $match: { $expr: { $eq: ['$classId', '$$cId'] }, status: class_member_schema_1.JoinStatus.APPROVED } }],
                    as: 'approved'
                }
            },
            {
                $lookup: {
                    from: 'class_members',
                    let: { cId: '$_id' },
                    pipeline: [{ $match: { $expr: { $eq: ['$classId', '$$cId'] }, status: class_member_schema_1.JoinStatus.PENDING } }],
                    as: 'pending'
                }
            },
            {
                $project: {
                    _id: 0,
                    id: { $toString: '$_id' },
                    name: 1,
                    code: 1,
                    description: 1,
                    isPublic: 1,
                    isLocked: 1,
                    coverImageUrl: 1,
                    createdAt: 1,
                    studentCount: { $size: '$approved' },
                    pendingCount: { $size: '$pending' }
                }
            }
        ];
        const result = await this.classModel.aggregate(pipeline).exec();
        return result[0] || null;
    }
    async rotateAllActiveCodes(generateCodeFn) {
        const activeClasses = await this.classModel.find({ isLocked: false }).select('_id').lean().exec();
        if (!activeClasses.length)
            return 0;
        const bulkOps = activeClasses.map((cls) => ({
            updateOne: {
                filter: { _id: cls._id },
                update: { $set: { code: generateCodeFn() } },
            },
        }));
        const result = await this.classModel.bulkWrite(bulkOps, { ordered: false });
        return result.modifiedCount;
    }
};
exports.ClassesRepository = ClassesRepository;
exports.ClassesRepository = ClassesRepository = ClassesRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(class_schema_1.Class.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection])
], ClassesRepository);
//# sourceMappingURL=classes.repository.js.map