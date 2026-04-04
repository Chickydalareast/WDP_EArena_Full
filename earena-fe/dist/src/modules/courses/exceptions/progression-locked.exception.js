"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressionLockedException = void 0;
const common_1 = require("@nestjs/common");
class ProgressionLockedException extends common_1.ForbiddenException {
    constructor(previousLessonId) {
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
exports.ProgressionLockedException = ProgressionLockedException;
//# sourceMappingURL=progression-locked.exception.js.map