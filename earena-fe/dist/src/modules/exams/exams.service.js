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
var ExamsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const exams_repository_1 = require("./exams.repository");
const exam_papers_repository_1 = require("./exam-papers.repository");
const questions_repository_1 = require("../questions/questions.repository");
const question_folders_repository_1 = require("../questions/question-folders.repository");
const courses_repository_1 = require("../courses/courses.repository");
const lessons_repository_1 = require("../courses/repositories/lessons.repository");
const exam_submissions_repository_1 = require("./exam-submissions.repository");
const users_service_1 = require("../users/users.service");
const exam_schema_1 = require("./schemas/exam.schema");
const dto_1 = require("./dto");
const question_schema_1 = require("../questions/schemas/question.schema");
let ExamsService = ExamsService_1 = class ExamsService {
    examsRepo;
    examPapersRepo;
    questionsRepo;
    coursesRepo;
    lessonsRepo;
    usersService;
    examSubmissionsRepo;
    foldersRepo;
    connection;
    logger = new common_1.Logger(ExamsService_1.name);
    constructor(examsRepo, examPapersRepo, questionsRepo, coursesRepo, lessonsRepo, usersService, examSubmissionsRepo, foldersRepo, connection) {
        this.examsRepo = examsRepo;
        this.examPapersRepo = examPapersRepo;
        this.questionsRepo = questionsRepo;
        this.coursesRepo = coursesRepo;
        this.lessonsRepo = lessonsRepo;
        this.usersService = usersService;
        this.examSubmissionsRepo = examSubmissionsRepo;
        this.foldersRepo = foldersRepo;
        this.connection = connection;
    }
    async initManualExam(teacherId, payload) {
        const teacher = await this.usersService.findById(teacherId);
        if (!teacher || !teacher.subjectIds?.length) {
            throw new common_1.BadRequestException('Giáo viên chưa được phân công môn học nào. Không thể tạo đề.');
        }
        const isAllowedSubject = teacher.subjectIds.some((subject) => {
            const subjectIdStr = (subject._id || subject.id || subject).toString();
            return subjectIdStr === payload.subjectId;
        });
        if (!isAllowedSubject) {
            this.logger.warn(`[Security Alert] Teacher ${teacherId} cố tạo đề cho môn học không được phân công: ${payload.subjectId}`);
            throw new common_1.ForbiddenException('Bạn không có quyền tạo đề thi cho môn học này.');
        }
        const targetSubjectObjectId = new mongoose_2.Types.ObjectId(payload.subjectId);
        return this.examsRepo.executeInTransaction(async () => {
            const folder = await this.foldersRepo.createDocument({
                name: `Tài nguyên: ${payload.title}`,
                description: 'Thư mục tự động sinh để chứa câu hỏi cho đề thi này.',
                ownerId: new mongoose_2.Types.ObjectId(teacherId),
                parentId: null,
            });
            const exam = await this.examsRepo.createDocument({
                title: payload.title,
                description: payload.description,
                totalScore: payload.totalScore,
                teacherId: new mongoose_2.Types.ObjectId(teacherId),
                subjectId: targetSubjectObjectId,
                type: exam_schema_1.ExamType.PRACTICE,
                mode: exam_schema_1.ExamMode.STATIC,
                isPublished: false,
                folderId: folder._id,
            });
            const paper = await this.examPapersRepo.createDocument({
                examId: exam._id,
                questions: [],
                answerKeys: [],
            });
            this.logger.log(`[Manual Builder] Teacher ${teacherId} created Exam ${exam._id} (Subject: ${payload.subjectId})`);
            return {
                message: 'Khởi tạo vỏ đề thi thành công.',
                examId: exam._id,
                paperId: paper._id,
            };
        });
    }
    async buildPaperDetailPayload(filter) {
        const paperModel = this.examPapersRepo.modelInstance;
        const paper = await paperModel
            .findOne(filter)
            .populate('examId', 'teacherId folderId isPublished type')
            .populate('questions.attachedMedia', 'url mimetype provider originalName _id')
            .select('+answerKeys')
            .lean();
        if (!paper)
            throw new common_1.NotFoundException('Không tìm thấy mã đề.');
        const nestedQuestions = [];
        const passageMap = new Map();
        for (const q of paper.questions) {
            if (q.type === 'PASSAGE') {
                const passageObj = { ...q, subQuestions: [] };
                passageMap.set(q.originalQuestionId.toString(), passageObj);
                nestedQuestions.push(passageObj);
            }
            else if (!q.parentPassageId) {
                nestedQuestions.push(q);
            }
        }
        for (const q of paper.questions) {
            if (q.parentPassageId) {
                const parentIdStr = q.parentPassageId.toString();
                const parentPassage = passageMap.get(parentIdStr);
                if (parentPassage) {
                    parentPassage.subQuestions.push(q);
                }
                else {
                    this.logger.warn(`[Data Integrity Warning] Câu hỏi con ${q.originalQuestionId} bị mồ côi trong đề`);
                    nestedQuestions.push(q);
                }
            }
        }
        nestedQuestions.forEach((q) => {
            if (q.type === 'PASSAGE' && q.subQuestions.length > 0) {
                q.subQuestions.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
            }
        });
        paper.questions = nestedQuestions;
        return paper;
    }
    async getPaperDetail(paperId, teacherId) {
        if (!mongoose_2.Types.ObjectId.isValid(paperId))
            throw new common_1.BadRequestException('Mã đề không hợp lệ.');
        const paper = await this.buildPaperDetailPayload({
            _id: new mongoose_2.Types.ObjectId(paperId),
        });
        const exam = paper.examId;
        if (exam.teacherId.toString() !== teacherId) {
            this.logger.warn(`[Security Alert] User ${teacherId} cố truy cập trái phép Paper ${paperId}`);
            throw new common_1.ForbiddenException('Bạn không có quyền xem chi tiết đề thi này.');
        }
        if (exam.type === exam_schema_1.ExamType.COURSE_QUIZ) {
            throw new common_1.ForbiddenException('Không thể xem chi tiết cấu trúc đề của bài Quiz thuộc khóa học tại đây.');
        }
        const folderId = exam.folderId?.toString() || null;
        paper.examId = exam._id;
        return { ...paper, folderId };
    }
    async getPaperDetailByExamIdForAdmin(examId) {
        if (!mongoose_2.Types.ObjectId.isValid(examId))
            throw new common_1.BadRequestException('ID Đề thi không hợp lệ.');
        const paper = await this.buildPaperDetailPayload({
            examId: new mongoose_2.Types.ObjectId(examId),
        });
        const exam = paper.examId;
        const folderId = exam.folderId?.toString() || null;
        paper.examId = exam._id;
        return { ...paper, folderId };
    }
    async updatePaperQuestions(paperId, teacherId, payload) {
        const { action, questionId, questionIds } = payload;
        if (!mongoose_2.Types.ObjectId.isValid(paperId)) {
            throw new common_1.BadRequestException('ID Đề thi không hợp lệ.');
        }
        const paperObjectId = new mongoose_2.Types.ObjectId(paperId);
        const paper = await this.examPapersRepo.modelInstance
            .findById(paperObjectId)
            .populate('examId', 'teacherId isPublished')
            .exec();
        if (!paper)
            throw new common_1.NotFoundException('Mã đề không tồn tại.');
        const exam = paper.examId;
        if (exam.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Bạn không có quyền sửa đề thi này.');
        if (exam.isPublished)
            throw new common_1.BadRequestException('Đề thi đã khóa (Published). Không thể thay đổi nội dung.');
        if (action === dto_1.PaperUpdateAction.REORDER) {
            if (!questionIds || questionIds.length === 0) {
                throw new common_1.BadRequestException('Danh sách ID không hợp lệ.');
            }
            const currentQuestions = paper.questions;
            const questionMap = new Map();
            const subQuestionsMap = new Map();
            for (const q of currentQuestions) {
                const idStr = q.originalQuestionId.toString();
                if (q.parentPassageId) {
                    const parentIdStr = q.parentPassageId.toString();
                    if (!subQuestionsMap.has(parentIdStr)) {
                        subQuestionsMap.set(parentIdStr, []);
                    }
                    subQuestionsMap.get(parentIdStr).push(q);
                }
                else {
                    questionMap.set(idStr, q);
                }
            }
            const totalRootsInDB = Array.from(questionMap.keys()).length;
            const validRootsSent = questionIds.filter((id) => questionMap.has(id)).length;
            if (validRootsSent !== totalRootsInDB) {
                throw new common_1.BadRequestException('Danh sách sắp xếp bị thiếu sót dữ liệu. Vui lòng làm mới trang và thử lại.');
            }
            const newQuestionsArray = [];
            let newOrderIndex = 1;
            for (const rootId of questionIds) {
                const rootQ = questionMap.get(rootId);
                if (!rootQ)
                    continue;
                rootQ.orderIndex = newOrderIndex++;
                newQuestionsArray.push(rootQ);
                if (rootQ.type === 'PASSAGE') {
                    const subs = subQuestionsMap.get(rootId) || [];
                    subs.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
                    for (const sub of subs) {
                        sub.orderIndex = newOrderIndex++;
                        newQuestionsArray.push(sub);
                    }
                }
            }
            await this.examPapersRepo.updateByIdSafe(paperObjectId, {
                $set: { questions: newQuestionsArray },
            });
            this.logger.log(`[Exam Builder] User ${teacherId} reordered Paper ${paperId}`);
            return { message: 'Đã lưu lại thứ tự câu hỏi mới.' };
        }
        if (!questionId || !mongoose_2.Types.ObjectId.isValid(questionId)) {
            throw new common_1.BadRequestException('ID câu hỏi không hợp lệ.');
        }
        const questionObjectId = new mongoose_2.Types.ObjectId(questionId);
        if (action === dto_1.PaperUpdateAction.ADD) {
            const isExist = paper.questions.some((q) => q.originalQuestionId.toString() === questionId);
            if (isExist)
                throw new common_1.ConflictException('Câu hỏi/Đoạn văn này đã tồn tại trong đề thi.');
            const question = await this.questionsRepo.findByIdSafe(questionObjectId);
            if (!question)
                throw new common_1.NotFoundException('Câu hỏi gốc không tồn tại trong Ngân hàng.');
            if (question.parentPassageId)
                throw new common_1.BadRequestException('Vui lòng chọn Đoạn văn mẹ để thêm vào đề, hệ thống sẽ tự động kéo theo câu hỏi con.');
            const questionsToPush = [];
            const keysToPush = [];
            if (question.type === 'PASSAGE') {
                const subQuestions = await this.questionsRepo.modelInstance
                    .find({ parentPassageId: questionObjectId })
                    .sort({ orderIndex: 1 })
                    .lean();
                if (subQuestions.length === 0)
                    throw new common_1.BadRequestException('Đoạn văn này chưa có câu hỏi con nào.');
                questionsToPush.push({
                    originalQuestionId: question._id,
                    type: question.type,
                    parentPassageId: null,
                    orderIndex: question.orderIndex,
                    content: question.content,
                    explanation: question.explanation,
                    difficultyLevel: question.difficultyLevel,
                    answers: [],
                    attachedMedia: question.attachedMedia || [],
                });
                for (const sub of subQuestions) {
                    const correctAns = sub.answers.find((a) => a.isCorrect);
                    if (!correctAns)
                        throw new common_1.BadRequestException(`Câu hỏi con (ID: ${sub._id}) chưa set đáp án đúng.`);
                    questionsToPush.push({
                        originalQuestionId: sub._id,
                        type: sub.type,
                        parentPassageId: question._id,
                        orderIndex: sub.orderIndex,
                        content: sub.content,
                        explanation: sub.explanation,
                        difficultyLevel: sub.difficultyLevel,
                        answers: sub.answers.map((a) => ({
                            id: a.id,
                            content: a.content,
                        })),
                        attachedMedia: sub.attachedMedia || [],
                    });
                    keysToPush.push({
                        originalQuestionId: sub._id,
                        correctAnswerId: correctAns.id,
                    });
                }
            }
            else {
                const correctAns = question.answers.find((a) => a.isCorrect);
                if (!correctAns)
                    throw new common_1.BadRequestException('Câu hỏi gốc chưa được set đáp án đúng.');
                questionsToPush.push({
                    originalQuestionId: question._id,
                    type: question.type,
                    parentPassageId: null,
                    orderIndex: question.orderIndex,
                    content: question.content,
                    explanation: question.explanation,
                    difficultyLevel: question.difficultyLevel,
                    answers: question.answers.map((a) => ({
                        id: a.id,
                        content: a.content,
                    })),
                    attachedMedia: question.attachedMedia || [],
                });
                keysToPush.push({
                    originalQuestionId: question._id,
                    correctAnswerId: correctAns.id,
                });
            }
            await this.examPapersRepo.modelInstance.updateOne({ _id: paperObjectId }, {
                $push: {
                    questions: { $each: questionsToPush },
                    answerKeys: { $each: keysToPush },
                },
            });
            return {
                message: `Đã thêm thành công ${questionsToPush.length} nội dung vào đề.`,
            };
        }
        if (action === dto_1.PaperUpdateAction.REMOVE) {
            const idsToRemove = [questionId];
            const childQuestions = paper.questions.filter((q) => q.parentPassageId?.toString() === questionId);
            idsToRemove.push(...childQuestions.map((q) => q.originalQuestionId.toString()));
            const objectIdsToRemove = idsToRemove.map((id) => new mongoose_2.Types.ObjectId(id));
            await this.examPapersRepo.updateByIdSafe(paperObjectId, {
                $pull: {
                    questions: { originalQuestionId: { $in: objectIdsToRemove } },
                    answerKeys: { originalQuestionId: { $in: objectIdsToRemove } },
                },
            });
            return {
                message: `Đã gỡ bỏ thành công ${idsToRemove.length} nội dung khỏi đề.`,
            };
        }
    }
    async publishExam(examId, teacherId) {
        if (!mongoose_2.Types.ObjectId.isValid(examId))
            throw new common_1.BadRequestException('ID Đề thi không hợp lệ.');
        const exam = await this.examsRepo.findByIdSafe(new mongoose_2.Types.ObjectId(examId));
        if (!exam)
            throw new common_1.NotFoundException('Đề thi không tồn tại.');
        if (exam.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Không có quyền thao tác.');
        if (exam.type === exam_schema_1.ExamType.COURSE_QUIZ) {
            throw new common_1.ForbiddenException('Đề thi ngầm của khóa học được quản lý tự động, không thể Publish thủ công.');
        }
        if (exam.isPublished)
            throw new common_1.BadRequestException('Đề thi này đã được chốt từ trước.');
        await this.examsRepo.updateByIdSafe(new mongoose_2.Types.ObjectId(examId), {
            $set: { isPublished: true },
        });
        this.logger.log(`[Publish] Teacher ${teacherId} published Exam ${examId}.`);
        return {
            message: 'Chốt đề thi thành công! Đề thi đã sẵn sàng đưa vào khóa học.',
        };
    }
    async getExams(teacherId, payload) {
        const { page = 1, limit = 10, search, type, subjectId } = payload;
        if (type === exam_schema_1.ExamType.COURSE_QUIZ) {
            throw new common_1.ForbiddenException('Hệ thống không cho phép truy vấn trực tiếp kho đề thi ngầm của khóa học.');
        }
        const result = await this.examsRepo.getExamsWithPagination(teacherId, page, limit, search, type, subjectId);
        const mappedItems = result.items.map((item) => {
            const { _id, ...rest } = item;
            return { id: _id.toString(), ...rest };
        });
        return {
            items: mappedItems,
            meta: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit),
            },
        };
    }
    async updateExam(examId, teacherId, payload) {
        if (!mongoose_2.Types.ObjectId.isValid(examId))
            throw new common_1.BadRequestException('Mã đề thi không hợp lệ.');
        const exam = await this.examsRepo.findByIdSafe(examId);
        if (!exam)
            throw new common_1.NotFoundException('Đề thi không tồn tại.');
        if (exam.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Bạn không có quyền sửa đề thi này.');
        if (exam.type === exam_schema_1.ExamType.COURSE_QUIZ) {
            throw new common_1.ForbiddenException('Đây là đề thi ngầm của khóa học. Vui lòng vào giao diện Course Builder để cập nhật.');
        }
        if (exam.isPublished && payload.totalScore) {
            throw new common_1.BadRequestException('Đề thi đã được phát hành, không thể thay đổi điểm số tổng.');
        }
        const updated = await this.examsRepo.updateByIdSafe(examId, {
            $set: payload,
        });
        return { message: 'Cập nhật thông tin đề thi thành công.', exam: updated };
    }
    async getLeaderboard(teacherId, payload) {
        const { courseId, lessonId, page, limit, search } = payload;
        if (!mongoose_2.Types.ObjectId.isValid(courseId) ||
            !mongoose_2.Types.ObjectId.isValid(lessonId)) {
            throw new common_1.BadRequestException('ID không hợp lệ.');
        }
        const course = await this.coursesRepo.findByIdSafe(courseId, {
            select: 'teacherId',
        });
        if (!course || course.teacherId.toString() !== teacherId) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem thống kê của khóa học này.');
        }
        const result = await this.examSubmissionsRepo.getLeaderboardData(courseId, lessonId, page, limit, search);
        return {
            items: result.items,
            meta: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit),
            },
        };
    }
    async deleteExam(examId, teacherId) {
        if (!mongoose_2.Types.ObjectId.isValid(examId))
            throw new common_1.BadRequestException('Mã đề thi không hợp lệ.');
        const exam = await this.examsRepo.findByIdSafe(new mongoose_2.Types.ObjectId(examId));
        if (!exam)
            throw new common_1.NotFoundException('Đề thi không tồn tại.');
        if (exam.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Bạn không có quyền xóa đề thi này.');
        if (exam.type === exam_schema_1.ExamType.COURSE_QUIZ) {
            throw new common_1.ForbiddenException('Đây là đề thi ngầm. Bạn phải xóa Bài học (Lesson) tương ứng trong khóa học để dọn dẹp đề này.');
        }
        if (exam.isPublished) {
            throw new common_1.BadRequestException('Đề thi đã được đưa vào khóa học. Không thể xóa để bảo toàn lịch sử.');
        }
        return this.examsRepo.executeInTransaction(async () => {
            await this.examsRepo.deleteOneSafe({ _id: exam._id });
            await this.examPapersRepo.deleteManySafe({ examId: exam._id });
            this.logger.log(`[Delete] Teacher ${teacherId} đã xóa vĩnh viễn Exam ${examId}`);
            return { message: 'Xóa đề thi thành công.' };
        });
    }
    async updatePaperPoints(paperId, teacherId, payload) {
        if (!mongoose_2.Types.ObjectId.isValid(paperId))
            throw new common_1.BadRequestException('ID Đề thi không hợp lệ.');
        const paperObjId = new mongoose_2.Types.ObjectId(paperId);
        const paper = await this.examPapersRepo.modelInstance
            .findById(paperObjId)
            .populate('examId', 'teacherId isPublished totalScore')
            .lean()
            .exec();
        if (!paper)
            throw new common_1.NotFoundException('Mã đề không tồn tại.');
        const exam = paper.examId;
        if (exam.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Bạn không có quyền sửa đề thi này.');
        if (exam.isPublished)
            throw new common_1.BadRequestException('Đề thi đã khóa (Published). Không thể sửa điểm.');
        let updatedQuestions = [...paper.questions];
        if (payload.divideEqually) {
            if (!exam.totalScore || exam.totalScore <= 0) {
                throw new common_1.BadRequestException('Tổng điểm của đề thi (Exam) phải lớn hơn 0 để có thể chia đều.');
            }
            const answerableQuestions = updatedQuestions.filter((q) => q.type !== question_schema_1.QuestionType.PASSAGE);
            if (answerableQuestions.length === 0) {
                throw new common_1.BadRequestException('Đề thi chưa có câu hỏi nào để tính điểm.');
            }
            const pointPerQuestion = Number((exam.totalScore / answerableQuestions.length).toFixed(2));
            updatedQuestions = updatedQuestions.map((q) => {
                if (q.type !== question_schema_1.QuestionType.PASSAGE)
                    q.points = pointPerQuestion;
                return q;
            });
        }
        else if (payload.pointsData && payload.pointsData.length > 0) {
            const pointsMap = new Map();
            payload.pointsData.forEach((p) => pointsMap.set(p.questionId, p.points));
            updatedQuestions = updatedQuestions.map((q) => {
                const qIdStr = q.originalQuestionId.toString();
                if (pointsMap.has(qIdStr)) {
                    q.points = pointsMap.get(qIdStr);
                }
                return q;
            });
        }
        else {
            throw new common_1.BadRequestException('Vui lòng chọn cờ "Chia đều điểm" hoặc gửi mảng danh sách điểm cụ thể.');
        }
        await this.examPapersRepo.updateByIdSafe(paperObjId, {
            $set: { questions: updatedQuestions },
        });
        this.logger.log(`[Exam Builder] Teacher ${teacherId} updated points for Paper ${paperId}`);
        return { message: 'Cập nhật điểm số thành công.' };
    }
    async unpublishAllQuizzesByCourse(courseId) {
        const courseObjId = new mongoose_2.Types.ObjectId(courseId);
        const lessons = await this.lessonsRepo.modelInstance
            .find({ courseId: courseObjId, examId: { $ne: null } })
            .select('examId')
            .lean()
            .exec();
        const examIdsToUnpublish = lessons.map((l) => l.examId);
        if (examIdsToUnpublish.length === 0)
            return;
        const result = await this.examsRepo.modelInstance.updateMany({
            _id: { $in: examIdsToUnpublish },
            type: exam_schema_1.ExamType.COURSE_QUIZ,
        }, { $set: { isPublished: false } });
        this.logger.log(`[Quiz Sync] Unpublished ${result.modifiedCount} quiz exams for course ${courseId}`);
    }
};
exports.ExamsService = ExamsService;
exports.ExamsService = ExamsService = ExamsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(8, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [exams_repository_1.ExamsRepository,
        exam_papers_repository_1.ExamPapersRepository,
        questions_repository_1.QuestionsRepository,
        courses_repository_1.CoursesRepository,
        lessons_repository_1.LessonsRepository,
        users_service_1.UsersService,
        exam_submissions_repository_1.ExamSubmissionsRepository,
        question_folders_repository_1.QuestionFoldersRepository,
        mongoose_2.Connection])
], ExamsService);
//# sourceMappingURL=exams.service.js.map