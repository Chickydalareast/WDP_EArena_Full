import { SectionPreview, ReorderCurriculumPayload } from '../types/course.schema';


export const buildReorderPayload = (sections: SectionPreview[]): ReorderCurriculumPayload => {
    const payload: ReorderCurriculumPayload = {
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