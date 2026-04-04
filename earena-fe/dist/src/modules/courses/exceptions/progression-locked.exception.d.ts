import { ForbiddenException } from '@nestjs/common';
export declare class ProgressionLockedException extends ForbiddenException {
    constructor(previousLessonId?: string);
}
