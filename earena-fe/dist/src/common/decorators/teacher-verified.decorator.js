"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireTeacherVerified = exports.IS_TEACHER_VERIFIED_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.IS_TEACHER_VERIFIED_KEY = 'isTeacherVerified';
const RequireTeacherVerified = () => (0, common_1.SetMetadata)(exports.IS_TEACHER_VERIFIED_KEY, true);
exports.RequireTeacherVerified = RequireTeacherVerified;
//# sourceMappingURL=teacher-verified.decorator.js.map