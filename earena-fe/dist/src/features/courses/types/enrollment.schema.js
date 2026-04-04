"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyLearningCourseSchema = void 0;
const zod_1 = require("zod");
exports.MyLearningCourseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    courseId: zod_1.z.string(),
    progress: zod_1.z.number().min(0).max(100),
    status: zod_1.z.string(),
    course: zod_1.z.object({
        title: zod_1.z.string(),
        slug: zod_1.z.string(),
        teacher: zod_1.z.object({
            fullName: zod_1.z.string(),
            avatar: zod_1.z.string().optional().nullable(),
        }),
        coverImage: zod_1.z.object({
            url: zod_1.z.string().url(),
            blurHash: zod_1.z.string().optional().nullable(),
        }).optional().nullable(),
    }),
});
//# sourceMappingURL=enrollment.schema.js.map