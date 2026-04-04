"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReorderPayload = void 0;
const buildReorderPayload = (sections) => {
    const payload = {
        sections: [],
        lessons: [],
    };
    sections.forEach((section, sectionIndex) => {
        payload.sections.push({
            id: section.id,
            order: sectionIndex + 1,
        });
        section.lessons.forEach((lesson, lessonIndex) => {
            payload.lessons.push({
                id: lesson.id,
                order: lessonIndex + 1,
                sectionId: section.id,
            });
        });
    });
    return payload;
};
exports.buildReorderPayload = buildReorderPayload;
//# sourceMappingURL=curriculum-utils.js.map