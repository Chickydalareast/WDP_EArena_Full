import {
    Injectable,
    Logger,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CoursesRepository } from '../courses.repository';
import { SectionsRepository } from '../repositories/sections.repository';
import { LessonsRepository } from '../repositories/lessons.repository';
import { EnrollmentsRepository } from '../repositories/enrollments.repository';
import { ExamsRepository } from '../../exams/exams.repository';
import { RedisService } from '../../../common/redis/redis.service';

import {
    CreateCourseQuizParams,
    UpdateCourseQuizParams,
    DeleteCourseQuizParams,
    GetQuizMatricesParams,
    PreviewQuizConfigParams,
    RulePreviewResult,
    RulePreviewParams,
    GetQuizHealthParams,
    QuizHealthResult,
    QuizHealthRuleStatus,
} from '../interfaces/course-quiz-builder.interface';
import { CourseStatus } from '../schemas/course.schema';
import { EnrollmentStatus } from '../schemas/enrollment.schema';
import {
    ExamDocument,
    ExamMode,
    ExamType,
} from '../../exams/schemas/exam.schema';
import {
    CourseEventPattern,
    CourseNewLessonEventPayload,
} from '../constants/course-event.constant';
import { ExamGeneratorService } from 'src/modules/exams/exam-generator.service';
import { ExamMatricesService } from 'src/modules/exams/exam-matrices.service';
import { SubmissionStatus } from 'src/modules/exams/schemas/exam-submission.schema';
import { ExamSubmissionsRepository } from 'src/modules/exams/exam-submissions.repository';
import { QuestionsRepository } from 'src/modules/questions/questions.repository';
import { ExamPapersRepository } from 'src/modules/exams/exam-papers.repository';

@Injectable()
export class CourseQuizBuilderService {
    private readonly logger = new Logger(CourseQuizBuilderService.name);

    constructor(
        private readonly coursesRepo: CoursesRepository,
        private readonly sectionsRepo: SectionsRepository,
        private readonly lessonsRepo: LessonsRepository,
        private readonly examsRepo: ExamsRepository,
        private readonly enrollmentsRepo: EnrollmentsRepository,
        private readonly submissionsRepo: ExamSubmissionsRepository,
        private readonly questionsRepo: QuestionsRepository,
        private readonly examPapersRepo: ExamPapersRepository,
        private readonly redisService: RedisService,
        private readonly eventEmitter: EventEmitter2,
        private readonly examMatricesService: ExamMatricesService,
        private readonly examGeneratorService: ExamGeneratorService,
    ) { }

    private async validateCourseOwnership(courseId: string, teacherId: string) {
        const course = await this.coursesRepo.findByIdSafe(
            new Types.ObjectId(courseId),
            { select: 'teacherId slug status subjectId title' },
        );
        if (!course) throw new NotFoundException('Không tìm thấy khóa học.');
        if (course.teacherId.toString() !== teacherId) {
            throw new ForbiddenException(
                'Bạn không có quyền chỉnh sửa khóa học này.',
            );
        }
        return course;
    }

    private async checkStructureLock(
        courseId: string,
        actionName: string,
    ): Promise<void> {
        const studentCount =
            await this.enrollmentsRepo.modelInstance.countDocuments({
                courseId: new Types.ObjectId(courseId),
                status: EnrollmentStatus.ACTIVE,
            });

        if (studentCount > 0) {
            throw new ForbiddenException(
                `Hành động bị từ chối (${actionName})! Không thể xóa Bài học khi khóa học đã có học viên ghi danh, nhằm bảo vệ toàn vẹn lịch sử học tập.`,
            );
        }
    }

    async createUnifiedQuizLesson(params: CreateCourseQuizParams) {
        const {
            teacherId,
            courseId,
            sectionId,
            title,
            content,
            isFreePreview,
            totalScore,
            dynamicConfig,
            examRules,
        } = params;

        const courseObjId = new Types.ObjectId(courseId);
        const teacherObjId = new Types.ObjectId(teacherId);

        const course = await this.coursesRepo.findByIdSafe(courseObjId, {
            select: 'teacherId slug status subjectId title',
        });
        if (!course) throw new NotFoundException('Không tìm thấy khóa học.');
        if (course.teacherId.toString() !== teacherId) {
            throw new ForbiddenException(
                'Bạn không có quyền chỉnh sửa khóa học này.',
            );
        }
        if (!course.subjectId) {
            throw new BadRequestException(
                'Khóa học chưa được thiết lập Môn học (Subject). Vui lòng cập nhật khóa học trước khi tạo Quiz.',
            );
        }

        const section = await this.sectionsRepo.findByIdSafe(
            new Types.ObjectId(sectionId),
            { select: '_id courseId' },
        );
        if (!section || section.courseId.toString() !== courseId) {
            throw new NotFoundException(
                'Không tìm thấy Chương/Phần này trong khóa học.',
            );
        }

        const MAX_RETRIES = 3;
        let attempt = 0;

        while (attempt < MAX_RETRIES) {
            try {
                const createdLesson = await this.lessonsRepo.executeInTransaction(
                    async () => {
                        const newExam = await this.examsRepo.createDocument({
                            title: `Quiz: ${title} (Course Builder)`,
                            description: `Auto-generated unified quiz for course ${courseId}`,
                            teacherId: teacherObjId,
                            subjectId: course.subjectId,
                            totalScore: totalScore,
                            isPublished: true,
                            type: ExamType.COURSE_QUIZ,
                            mode: ExamMode.DYNAMIC,
                            dynamicConfig: dynamicConfig,
                        });

                        const nextOrder = await this.lessonsRepo.getNextOrder(
                            new Types.ObjectId(sectionId),
                        );

                        return await this.lessonsRepo.createDocument({
                            courseId: courseObjId,
                            sectionId: new Types.ObjectId(sectionId),
                            title: title,
                            content: content,
                            order: nextOrder,
                            isFreePreview: isFreePreview,
                            examId: newExam._id,
                            examRules: examRules,
                            attachments: [],
                        });
                    },
                );

                await this.redisService.del(`course:detail:${course.slug}`);
                this.logger.debug(
                    `[Unified Builder] Đã xóa cache cho course: ${course.slug}`,
                );

                const { _id, ...rest } = createdLesson as any;
                const lessonIdStr = _id.toString();

                if (course.status === CourseStatus.PUBLISHED) {
                    this.eventEmitter.emit(CourseEventPattern.COURSE_NEW_LESSON, {
                        courseId: course._id.toString(),
                        courseTitle: course.title,
                        lessonId: lessonIdStr,
                        lessonTitle: title,
                    } as CourseNewLessonEventPayload);
                }

                return { id: lessonIdStr, ...rest };
            } catch (error: any) {
                if (error.code === 11000) {
                    attempt++;
                    this.logger.warn(
                        `[Unified Builder] Race condition detected on order index. Retrying ${attempt}/${MAX_RETRIES}...`,
                    );
                    continue;
                }
                throw error;
            }
        }

        throw new ConflictException(
            'Hệ thống đang xử lý cấu trúc bài giảng. Vui lòng thử lại sau.',
        );
    }

    async deleteUnifiedQuizLesson(params: DeleteCourseQuizParams) {
        const { teacherId, courseId, lessonId } = params;
        const course = await this.validateCourseOwnership(courseId, teacherId);

        await this.checkStructureLock(courseId, 'Xóa Quiz Lesson');

        const lesson = await this.lessonsRepo.findByIdSafe(
            new Types.ObjectId(lessonId),
            { select: 'courseId examId' },
        );
        if (!lesson || lesson.courseId.toString() !== courseId) {
            throw new NotFoundException('Bài học không hợp lệ hoặc đã bị xóa.');
        }

        await this.lessonsRepo.executeInTransaction(async () => {
            await this.lessonsRepo.deleteOneSafe({
                _id: new Types.ObjectId(lessonId),
            });

            if (lesson.examId) {
                await this.examsRepo.deleteOneSafe({ _id: lesson.examId });
                this.logger.log(
                    `[Unified Builder] Đã xóa (cascade) Exam ngầm ${lesson.examId} cùng với Lesson ${lessonId}.`,
                );
            }
        });

        await this.redisService.del(`course:detail:${course.slug}`);
    }

    async getMatricesByCourseSubject(params: GetQuizMatricesParams) {
        const { teacherId, courseId, page, limit, search } = params;

        const course = await this.coursesRepo.findByIdSafe(
            new Types.ObjectId(courseId),
            { select: 'teacherId subjectId' },
        );

        if (!course) throw new NotFoundException('Không tìm thấy khóa học.');
        if (course.teacherId.toString() !== teacherId) {
            throw new ForbiddenException('Bạn không có quyền truy cập khóa học này.');
        }
        if (!course.subjectId) {
            throw new BadRequestException(
                'Khóa học chưa được thiết lập Môn học (Subject). ' +
                'Vui lòng cập nhật khóa học trước khi tìm Khuôn mẫu Ma trận.',
            );
        }

        return this.examMatricesService.getMatrices(teacherId, {
            page,
            limit,
            subjectId: course.subjectId.toString(),
            search,
        });
    }

    async getAvailableCountForRule(
        params: RulePreviewParams,
    ): Promise<RulePreviewResult> {
        const availableCount =
            await this.examGeneratorService.countAvailableForRule(params.teacherId, {
                folderIds: params.folderIds,
                topicIds: params.topicIds,
                difficulties: params.difficulties,
                tags: params.tags,
                limit: params.limit,
            });

        const safetyRatio =
            params.limit > 0
                ? parseFloat((availableCount / params.limit).toFixed(2))
                : 0;

        return {
            availableCount,
            requiredCount: params.limit,
            isSufficient: availableCount >= params.limit,
            safetyRatio,
        };
    }

    async previewQuizConfig(params: PreviewQuizConfigParams) {
        const rateLimitKey = `ratelimit:quiz-preview:${params.teacherId}`;
        const isAllowed = await this.redisService.setNx(rateLimitKey, '1', 10);
        if (!isAllowed) {
            throw new BadRequestException(
                'Bạn đang gửi yêu cầu xem trước quá nhanh. Vui lòng chờ 10 giây và thử lại.',
            );
        }

        return this.examGeneratorService.previewDynamicExam({
            teacherId: params.teacherId,
            matrixId: params.matrixId,
            adHocSections: params.adHocSections,
        });
    }

    async updateUnifiedQuizLesson(params: UpdateCourseQuizParams) {
        const {
            teacherId,
            courseId,
            lessonId,
            title,
            content,
            isFreePreview,
            totalScore,
            dynamicConfig,
            examRules,
        } = params;
        const course = await this.validateCourseOwnership(courseId, teacherId);

        const lesson = await this.lessonsRepo.findByIdSafe(
            new Types.ObjectId(lessonId),
        );
        if (!lesson || lesson.courseId.toString() !== courseId) {
            throw new NotFoundException('Bài học không tồn tại trong khóa học này.');
        }
        if (!lesson.examId) {
            throw new BadRequestException(
                'Bài học này không phải là định dạng Quiz.',
            );
        }

        if (dynamicConfig !== undefined) {
            const completedSubmissionsCount =
                await this.submissionsRepo.modelInstance.countDocuments({
                    lessonId: new Types.ObjectId(lessonId),
                    status: SubmissionStatus.COMPLETED,
                });

            if (completedSubmissionsCount > 0) {
                throw new ConflictException(
                    `Không thể thay đổi cấu hình bốc đề (dynamicConfig) vì đã có ${completedSubmissionsCount} lượt làm bài hoàn thành. ` +
                    `Thay đổi này sẽ phá vỡ tính nhất quán dữ liệu học tập. ` +
                    `Chỉ có thể cập nhật tiêu đề, nội dung và quy tắc thi.`,
                );
            }
        }

        const lessonUpdatePayload: any = {};
        if (title !== undefined) lessonUpdatePayload.title = title;
        if (content !== undefined) lessonUpdatePayload.content = content;
        if (isFreePreview !== undefined)
            lessonUpdatePayload.isFreePreview = isFreePreview;
        if (examRules !== undefined) lessonUpdatePayload.examRules = examRules;

        const examUpdatePayload: any = {};
        if (title !== undefined)
            examUpdatePayload.title = `Quiz: ${title} (Course Builder)`;
        if (totalScore !== undefined) examUpdatePayload.totalScore = totalScore;
        if (dynamicConfig !== undefined)
            examUpdatePayload.dynamicConfig = dynamicConfig;

        const updatedLesson = await this.lessonsRepo.executeInTransaction(
            async () => {
                if (Object.keys(examUpdatePayload).length > 0) {
                    await this.examsRepo.updateByIdSafe(lesson.examId!, {
                        $set: examUpdatePayload,
                    });
                }
                if (Object.keys(lessonUpdatePayload).length > 0) {
                    return await this.lessonsRepo.updateByIdSafe(
                        new Types.ObjectId(lessonId),
                        { $set: lessonUpdatePayload },
                    );
                }
                return lesson;
            },
        );

        await this.redisService.del(`course:detail:${course.slug}`);
        this.logger.log(
            `[Unified Builder] Đã cập nhật Quiz Lesson ${lessonId} và Exam ngầm ${lesson.examId}.`,
        );

        return { id: lessonId, ...(updatedLesson as any) };
    }

async getQuizHealth(params: GetQuizHealthParams): Promise<QuizHealthResult> {
        const { teacherId, courseId, lessonId } = params;

        await this.validateCourseOwnership(courseId, teacherId);

        const lesson = await this.lessonsRepo.findByIdSafe(
            new Types.ObjectId(lessonId),
            { populate: 'examId' },
        );

        if (!lesson || lesson.courseId.toString() !== courseId) {
            throw new NotFoundException('Bài học không tồn tại trong khóa học này.');
        }
        if (!lesson.examId) {
            throw new BadRequestException(
                'Bài học này không phải là định dạng Quiz.',
            );
        }

        const exam = lesson.examId as unknown as ExamDocument;

        // [MAX PING]: Kiểm tra xem bài thi đã có kết quả hoàn thành chưa để khóa Form
        const completedCount = await this.submissionsRepo.modelInstance.countDocuments({
            lessonId: new Types.ObjectId(lessonId),
            status: SubmissionStatus.COMPLETED
        });
        const isLocked = completedCount > 0;

        if (!exam.dynamicConfig) {
            return {
                lessonId,
                examId: exam._id.toString(),
                isHealthy: false,
                hasWarning: false,
                isLocked, // Trả về cờ isLocked khi chưa có config
                matrixExists: null,
                configMode: 'unconfigured',
                rules: [],
            };
        }

        const hasMatrix = !!exam.dynamicConfig.matrixId;
        const hasAdHoc = (exam.dynamicConfig.adHocSections?.length ?? 0) > 0;
        const configMode = hasMatrix
            ? 'matrix'
            : hasAdHoc
                ? 'adHoc'
                : 'unconfigured';

        let matrixExists: boolean | null = null;
        if (hasMatrix) {
            try {
                await this.examMatricesService.getMatrixDetail(
                    exam.dynamicConfig.matrixId!.toString(),
                    teacherId,
                );
                matrixExists = true;
            } catch {
                matrixExists = false;
            }
        }

        let sectionsToCheck: any[] = [];
        if (hasMatrix && matrixExists) {
            const matrixDetail = await this.examMatricesService.getMatrixDetail(
                exam.dynamicConfig.matrixId!.toString(),
                teacherId,
            );
            sectionsToCheck = matrixDetail.sections;
        } else if (hasAdHoc) {
            sectionsToCheck = exam.dynamicConfig.adHocSections!;
        }

        const ruleStatusList: QuizHealthRuleStatus[] = [];

        await Promise.all(
            sectionsToCheck.map(async (section: any) => {
                const sectionRuleResults = await Promise.all(
                    section.rules.map(async (rule: any) => {
                        const availableCount =
                            await this.examGeneratorService.countAvailableForRule(teacherId, {
                                folderIds: rule.folderIds?.map((id: any) => id.toString()),
                                topicIds: rule.topicIds?.map((id: any) => id.toString()),
                                difficulties: rule.difficulties,
                                tags: rule.tags,
                                limit: rule.limit,
                            });

                        const safetyRatio =
                            rule.limit > 0
                                ? parseFloat((availableCount / rule.limit).toFixed(2))
                                : 0;

                        return {
                            sectionName: section.name,
                            requiredCount: rule.limit,
                            availableCount,
                            isSufficient: availableCount >= rule.limit,
                            safetyRatio,
                            isWarning: availableCount < rule.limit * 1.5,
                        } as QuizHealthRuleStatus;
                    }),
                );
                ruleStatusList.push(...sectionRuleResults);
            }),
        );

        const isHealthy =
            matrixExists !== false && ruleStatusList.every((r) => r.isSufficient);
        const hasWarning = ruleStatusList.some((r) => r.isWarning);

        return {
            lessonId,
            examId: exam._id.toString(),
            isHealthy,
            hasWarning,
            isLocked, // Trả về cho FE
            matrixExists,
            configMode,
            rules: ruleStatusList,
        };
    }

    async getQuizAnalyticsData(teacherId: string, courseId: string, lessonId: string) {
        await this.validateCourseOwnership(courseId, teacherId);

        const lesson = await this.lessonsRepo.findByIdSafe(new Types.ObjectId(lessonId), { populate: 'examId' });
        if (!lesson || lesson.courseId.toString() !== courseId) {
            throw new NotFoundException('Bài học không tồn tại trong khóa học này.');
        }
        
        const exam = lesson.examId as unknown as ExamDocument;
        const totalScore = exam.totalScore || 100;
        const passPercentage = lesson.examRules?.passPercentage || 50;

        return this.submissionsRepo.getQuizAnalyticsData(lessonId, passPercentage, totalScore);
    }

    async getTeacherAttemptHistory(teacherId: string, courseId: string, lessonId: string, page: number, limit: number, search?: string) {
        await this.validateCourseOwnership(courseId, teacherId);
        
        // Xác minh lesson thuộc course
        const lesson = await this.lessonsRepo.findOneSafe({ _id: new Types.ObjectId(lessonId), courseId: new Types.ObjectId(courseId) });
        if (!lesson) throw new NotFoundException('Bài học không tồn tại.');

        return this.submissionsRepo.getTeacherAttemptHistoryData(courseId, lessonId, page, limit, search);
    }

    async assignStaticQuestions(teacherId: string, courseId: string, lessonId: string, questionIds: string[]) {
        await this.validateCourseOwnership(courseId, teacherId);

        const lesson = await this.lessonsRepo.findByIdSafe(new Types.ObjectId(lessonId));
        if (!lesson || lesson.courseId.toString() !== courseId) {
            throw new NotFoundException('Bài học không tồn tại.');
        }
        if (!lesson.examId) throw new BadRequestException('Bài học này không phải là Quiz.');

        // 1. Lấy Data câu hỏi từ QuestionsRepository
        const objectIds = questionIds.map(id => new Types.ObjectId(id));
        const questions = await (this.questionsRepo as any).modelInstance
            .find({ _id: { $in: objectIds }, ownerId: new Types.ObjectId(teacherId), isArchived: false, isDraft: false })
            .lean()
            .exec();

        if (questions.length !== questionIds.length) {
            throw new BadRequestException('Một số câu hỏi không tồn tại, đang là bản nháp, hoặc bạn không có quyền sử dụng.');
        }

        // 2. Chuyển đổi định dạng sang PaperQuestion và lấy AnswerKeys
        const paperQuestions: any[] = [];
        const answerKeys: any[] = [];
        
        let orderIdx = 1;
        for (const q of questions) {
            const correctAns = q.answers?.find((a: any) => a.isCorrect);
            if (!correctAns && q.type !== 'PASSAGE') {
                throw new BadRequestException(`Câu hỏi gốc ID ${q._id} chưa được set đáp án đúng.`);
            }

            paperQuestions.push({
                originalQuestionId: q._id,
                type: q.type,
                parentPassageId: q.parentPassageId || null,
                orderIndex: orderIdx++,
                content: q.content,
                explanation: q.explanation || null,
                difficultyLevel: q.difficultyLevel,
                answers: q.answers?.map((a: any) => ({ id: a.id, content: a.content })) || [],
                attachedMedia: q.attachedMedia || [],
                points: null
            });

            if (correctAns) {
                answerKeys.push({
                    originalQuestionId: q._id,
                    correctAnswerId: correctAns.id
                });
            }
        }

        // 3. Transaction: Xóa Master Paper cũ (nếu có), tạo Master Paper mới, và update mode: STATIC
        await this.examsRepo.executeInTransaction(async () => {
            await (this.examPapersRepo as any).deleteManySafe({ 
                examId: lesson.examId, 
                submissionId: null // Xóa Master Paper cũ
            });

            await (this.examPapersRepo as any).createDocument({
                examId: lesson.examId,
                submissionId: null, // Đây là cờ đánh dấu Master Paper
                questions: paperQuestions,
                answerKeys: answerKeys,
            });

            await this.examsRepo.updateByIdSafe(lesson.examId!, {
                $set: { mode: ExamMode.STATIC }
            });
        });

        this.logger.log(`[Static Builder] Teacher ${teacherId} assigned ${questions.length} static questions to Quiz ${lessonId}`);
        return { totalAssigned: questions.length };
    }
}
