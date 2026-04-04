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
    MatrixSectionParam,
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
import { ExamGeneratorService } from '../../exams/exam-generator.service';
import { ExamMatricesService } from '../../exams/exam-matrices.service';
import { SubmissionStatus } from '../../exams/schemas/exam-submission.schema';
import { ExamSubmissionsRepository } from '../../exams/exam-submissions.repository';
import { QuestionsRepository } from '../../questions/questions.repository';
import { ExamPapersRepository } from '../../exams/exam-papers.repository';
import { RuleQuestionType } from '../../exams/interfaces/exam-matrix.interface';
import { QuestionType } from 'src/modules/questions/schemas/question.schema';

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

    // =========================================================================
    // [CTO UPGRADE]: Helper Method dọn dẹp Data Type (Tránh rò rỉ Types.ObjectId)
    // =========================================================================
    private mapMatrixToAdHocSections(sections: any[]): MatrixSectionParam[] {
        return sections.map((sec) => ({
            name: sec.name,
            orderIndex: sec.orderIndex,
            rules: sec.rules.map((rule: any) => ({
                questionType: rule.questionType ?? RuleQuestionType.MIXED,
                subQuestionLimit: rule.subQuestionLimit,
                folderIds: rule.folderIds?.map((id: Types.ObjectId) => id.toString()) || [],
                topicIds: rule.topicIds?.map((id: Types.ObjectId) => id.toString()) || [],
                difficulties: rule.difficulties || [],
                tags: rule.tags || [],
                limit: rule.limit,
            })),
        }));
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

        let snapshotConfig = dynamicConfig ? { ...dynamicConfig } : undefined;

        if (snapshotConfig && snapshotConfig.matrixId) {
            const matrixTemplate = await this.examMatricesService.getMatrixDetail(
                snapshotConfig.matrixId.toString(),
                teacherId,
            );
            // Sử dụng Helper để tránh Type Mismatch
            snapshotConfig.adHocSections = this.mapMatrixToAdHocSections(matrixTemplate.sections);
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
                            dynamicConfig: snapshotConfig,
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
                questionType: params.questionType,
                subQuestionLimit: params.subQuestionLimit,
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

            let snapshotConfig = { ...dynamicConfig };
            if (snapshotConfig.matrixId) {
                const matrixTemplate = await this.examMatricesService.getMatrixDetail(
                    snapshotConfig.matrixId.toString(),
                    teacherId,
                );
                // Sử dụng Helper
                snapshotConfig.adHocSections = this.mapMatrixToAdHocSections(matrixTemplate.sections);
            }
            examUpdatePayload.dynamicConfig = snapshotConfig;
        }

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
                isLocked,
                matrixExists: null,
                configMode: 'unconfigured',
                rules: [],
            };
        }

        const hasMatrix = !!exam.dynamicConfig.matrixId;
        const hasAdHoc = (exam.dynamicConfig.adHocSections?.length ?? 0) > 0;

        // [CTO UPGRADE]: Đảm bảo Literal Union Type chuẩn xác
        let configMode: 'matrix' | 'adHoc' | 'unconfigured' | 'snapshot' | 'matrix_missing' = 'unconfigured';

        let matrixExists: boolean | null = null;
        let sectionsToCheck: any[] = [];

        if (hasAdHoc) {
            sectionsToCheck = exam.dynamicConfig.adHocSections!;
            configMode = hasMatrix ? 'snapshot' : 'adHoc';
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
        } else if (hasMatrix) {
            try {
                const matrixDetail = await this.examMatricesService.getMatrixDetail(
                    exam.dynamicConfig.matrixId!.toString(),
                    teacherId,
                );
                sectionsToCheck = matrixDetail.sections;
                matrixExists = true;
                configMode = 'matrix';
            } catch {
                matrixExists = false;
                configMode = 'matrix_missing';
            }
        }

        const ruleStatusList: QuizHealthRuleStatus[] = [];

        await Promise.all(
            sectionsToCheck.map(async (section: any) => {
                const sectionRuleResults = await Promise.all(
                    section.rules.map(async (rule: any) => {
                        const questionType = rule.questionType ?? RuleQuestionType.MIXED;
                        const subQuestionLimit = questionType === RuleQuestionType.PASSAGE ? rule.subQuestionLimit : undefined;

                        const availableCount =
                            await this.examGeneratorService.countAvailableForRule(teacherId, {
                                questionType,
                                subQuestionLimit,
                                folderIds: rule.folderIds?.map((id: any) => id.toString()),
                                topicIds: rule.topicIds?.map((id: any) => id.toString()),
                                difficulties: rule.difficulties,
                                tags: rule.tags,
                                limit: rule.limit,
                            });

                        const isSufficient = availableCount >= rule.limit;
                        const safetyRatio = rule.limit > 0 ? parseFloat((availableCount / rule.limit).toFixed(2)) : 0;
                        const isWarning = availableCount < rule.limit * 1.5;
                        let errorMessage = '';

                        if (!isSufficient) {
                            if (questionType === RuleQuestionType.PASSAGE) {
                                errorMessage = `Thiếu Bài đọc. Cần ${rule.limit} đoạn văn, nhưng kho chỉ có ${availableCount} đoạn hợp lệ.`;
                            } else if (questionType === RuleQuestionType.FLAT) {
                                errorMessage = `Thiếu Câu hỏi đơn. Cần ${rule.limit} câu, nhưng kho chỉ có ${availableCount} câu hợp lệ.`;
                            } else {
                                errorMessage = `Thiếu Câu hỏi. Cần ${rule.limit} câu, nhưng kho chỉ có ${availableCount} câu hợp lệ.`;
                            }
                        } else if (isWarning) {
                            if (questionType === RuleQuestionType.PASSAGE) {
                                errorMessage = `Cảnh báo: Kho chỉ có ${availableCount} Đoạn văn. Đề thi sẽ dễ bị trùng lặp Bài đọc.`;
                            } else {
                                errorMessage = `Cảnh báo: Kho chỉ có ${availableCount} Câu hỏi. Đề thi sẽ thiếu tính xáo trộn.`;
                            }
                        }

                        return {
                            sectionName: section.name,
                            questionType,
                            requiredCount: rule.limit,
                            availableCount,
                            isSufficient,
                            safetyRatio,
                            isWarning,
                            errorMessage: errorMessage || undefined,
                        } as QuizHealthRuleStatus;
                    }),
                );
                ruleStatusList.push(...sectionRuleResults);
            }),
        );

        const isHealthy = configMode !== 'matrix_missing' && ruleStatusList.every((r) => r.isSufficient);
        const hasWarning = ruleStatusList.some((r) => r.isWarning);

        return {
            lessonId,
            examId: exam._id.toString(),
            isHealthy,
            hasWarning,
            isLocked,
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

        const lesson = await this.lessonsRepo.findOneSafe({ _id: new Types.ObjectId(lessonId), courseId: new Types.ObjectId(courseId) });
        if (!lesson) throw new NotFoundException('Bài học không tồn tại.');

        return this.submissionsRepo.getTeacherAttemptHistoryData(courseId, lessonId, page, limit, search);
    }

    async assignStaticQuestions(
        teacherId: string,
        courseId: string,
        lessonId: string,
        questionIds: string[]
    ) {
        const course = await this.coursesRepo.findOneSafe({
            _id: new Types.ObjectId(courseId)
        });

        if (!course || course.teacherId.toString() !== teacherId) {
            throw new ForbiddenException('Không tìm thấy khóa học, hoặc bạn không có quyền.');
        }

        const lesson = await this.lessonsRepo.findOneSafe({
            _id: new Types.ObjectId(lessonId),
            courseId: new Types.ObjectId(courseId)
        });

        if (!lesson) throw new NotFoundException('Không tìm thấy bài học.');
        if (!lesson.examId) throw new BadRequestException('Bài học này chưa được cấu hình làm bài thi.');

        const questionObjectIds = questionIds.map(id => new Types.ObjectId(id));

        const questions = await this.questionsRepo.findByIdsAndOwner(
            questionObjectIds,
            new Types.ObjectId(teacherId)
        );

        if (questions.length !== questionIds.length) {
            throw new BadRequestException('Một hoặc nhiều câu hỏi không tồn tại hoặc không thuộc quyền sở hữu của bạn.');
        }

        const paperQuestions: any[] = [];
        const answerKeys: any[] = [];
        let orderIdx = 1;

        for (const q of questions) {
            const correctAns = q.answers?.find((a: any) => a.isCorrect);
            if (q.type !== QuestionType.PASSAGE && !correctAns) {
                throw new ConflictException(`Câu hỏi gốc ID ${q._id} bị lỗi dữ liệu (không có đáp án đúng).`);
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

        await this.examsRepo.executeInTransaction(async () => {
            await this.examPapersRepo.deletePapersByExamAndSubmission(lesson.examId!, null);

            await this.examPapersRepo.createPaper({
                examId: lesson.examId,
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