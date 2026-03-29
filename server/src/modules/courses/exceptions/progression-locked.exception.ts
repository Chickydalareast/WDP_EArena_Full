import { ForbiddenException } from '@nestjs/common';

export class ProgressionLockedException extends ForbiddenException {
    constructor(previousLessonId?: string) {
        super({
            statusCode: 403,
            message: 'Bạn phải hoàn thành bài học trước đó để mở khóa nội dung này.',
            error: 'PROGRESSION_LOCKED',
            payload: {
                requiredLessonId: previousLessonId || null,
            },
        });
    }
}