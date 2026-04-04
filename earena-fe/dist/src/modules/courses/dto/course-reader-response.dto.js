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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonProgressResponseDto = exports.MyCourseReviewDto = exports.StudyTreeResponseDto = exports.CoursePublicDetailResponseDto = exports.CourseBasicDto = exports.CourseSubjectDto = exports.CourseTeacherDto = exports.CurriculumResponseDto = exports.SectionResponseDto = exports.LessonResponseDto = exports.ExamRuleConfigResponseDto = exports.MediaResponseDto = void 0;
const class_transformer_1 = require("class-transformer");
class MediaResponseDto {
    id;
    url;
    blurHash;
    duration;
    originalName;
    mimetype;
    size;
}
exports.MediaResponseDto = MediaResponseDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], MediaResponseDto.prototype, "url", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], MediaResponseDto.prototype, "blurHash", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], MediaResponseDto.prototype, "duration", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "originalName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MediaResponseDto.prototype, "mimetype", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], MediaResponseDto.prototype, "size", void 0);
class ExamRuleConfigResponseDto {
    timeLimit;
    maxAttempts;
    passPercentage;
    showResultMode;
}
exports.ExamRuleConfigResponseDto = ExamRuleConfigResponseDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ExamRuleConfigResponseDto.prototype, "timeLimit", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ExamRuleConfigResponseDto.prototype, "maxAttempts", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ExamRuleConfigResponseDto.prototype, "passPercentage", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ExamRuleConfigResponseDto.prototype, "showResultMode", void 0);
class LessonResponseDto {
    id;
    title;
    order;
    isFreePreview;
    content;
    examId;
    examMode;
    examType;
    isCompleted;
    examRules;
    primaryVideo;
    attachments;
    progress;
}
exports.LessonResponseDto = LessonResponseDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LessonResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LessonResponseDto.prototype, "title", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], LessonResponseDto.prototype, "order", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], LessonResponseDto.prototype, "isFreePreview", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], LessonResponseDto.prototype, "content", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], LessonResponseDto.prototype, "examId", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], LessonResponseDto.prototype, "examMode", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], LessonResponseDto.prototype, "examType", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], LessonResponseDto.prototype, "isCompleted", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => ExamRuleConfigResponseDto),
    __metadata("design:type", Object)
], LessonResponseDto.prototype, "examRules", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => MediaResponseDto),
    __metadata("design:type", Object)
], LessonResponseDto.prototype, "primaryVideo", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => MediaResponseDto),
    __metadata("design:type", Array)
], LessonResponseDto.prototype, "attachments", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => LessonProgressResponseDto),
    __metadata("design:type", Object)
], LessonResponseDto.prototype, "progress", void 0);
class SectionResponseDto {
    id;
    title;
    description;
    order;
    lessons;
}
exports.SectionResponseDto = SectionResponseDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SectionResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SectionResponseDto.prototype, "title", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SectionResponseDto.prototype, "description", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], SectionResponseDto.prototype, "order", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => LessonResponseDto),
    __metadata("design:type", Array)
], SectionResponseDto.prototype, "lessons", void 0);
class CurriculumResponseDto {
    id;
    totalLessons;
    totalVideos;
    totalDocuments;
    totalQuizzes;
    sections;
}
exports.CurriculumResponseDto = CurriculumResponseDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CurriculumResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], CurriculumResponseDto.prototype, "totalLessons", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], CurriculumResponseDto.prototype, "totalVideos", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], CurriculumResponseDto.prototype, "totalDocuments", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], CurriculumResponseDto.prototype, "totalQuizzes", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => SectionResponseDto),
    __metadata("design:type", Array)
], CurriculumResponseDto.prototype, "sections", void 0);
class CourseTeacherDto {
    id;
    fullName;
    avatar;
    bio;
}
exports.CourseTeacherDto = CourseTeacherDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseTeacherDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseTeacherDto.prototype, "fullName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseTeacherDto.prototype, "avatar", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseTeacherDto.prototype, "bio", void 0);
class CourseSubjectDto {
    id;
    name;
}
exports.CourseSubjectDto = CourseSubjectDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseSubjectDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseSubjectDto.prototype, "name", void 0);
class CourseBasicDto {
    id;
    title;
    slug;
    description;
    price;
    discountPrice;
    status;
    averageRating;
    totalReviews;
    benefits;
    requirements;
    createdAt;
    updatedAt;
    teacher;
    subject;
    coverImage;
    promotionalVideo;
    progressionMode;
    isStrictExam;
}
exports.CourseBasicDto = CourseBasicDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseBasicDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseBasicDto.prototype, "title", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseBasicDto.prototype, "slug", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseBasicDto.prototype, "description", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], CourseBasicDto.prototype, "price", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], CourseBasicDto.prototype, "discountPrice", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseBasicDto.prototype, "status", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], CourseBasicDto.prototype, "averageRating", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], CourseBasicDto.prototype, "totalReviews", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], CourseBasicDto.prototype, "benefits", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], CourseBasicDto.prototype, "requirements", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], CourseBasicDto.prototype, "createdAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], CourseBasicDto.prototype, "updatedAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => CourseTeacherDto),
    __metadata("design:type", CourseTeacherDto)
], CourseBasicDto.prototype, "teacher", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => CourseSubjectDto),
    __metadata("design:type", CourseSubjectDto)
], CourseBasicDto.prototype, "subject", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => MediaResponseDto),
    __metadata("design:type", MediaResponseDto)
], CourseBasicDto.prototype, "coverImage", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => MediaResponseDto),
    __metadata("design:type", MediaResponseDto)
], CourseBasicDto.prototype, "promotionalVideo", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseBasicDto.prototype, "progressionMode", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], CourseBasicDto.prototype, "isStrictExam", void 0);
class CoursePublicDetailResponseDto {
    isEnrolled;
    course;
    curriculum;
}
exports.CoursePublicDetailResponseDto = CoursePublicDetailResponseDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], CoursePublicDetailResponseDto.prototype, "isEnrolled", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => CourseBasicDto),
    __metadata("design:type", CourseBasicDto)
], CoursePublicDetailResponseDto.prototype, "course", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => CurriculumResponseDto),
    __metadata("design:type", CurriculumResponseDto)
], CoursePublicDetailResponseDto.prototype, "curriculum", void 0);
class StudyTreeResponseDto {
    progress;
    status;
    curriculum;
    myReview;
    progressionMode;
    isStrictExam;
}
exports.StudyTreeResponseDto = StudyTreeResponseDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], StudyTreeResponseDto.prototype, "progress", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], StudyTreeResponseDto.prototype, "status", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => CurriculumResponseDto),
    __metadata("design:type", CurriculumResponseDto)
], StudyTreeResponseDto.prototype, "curriculum", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => MyCourseReviewDto),
    __metadata("design:type", Object)
], StudyTreeResponseDto.prototype, "myReview", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], StudyTreeResponseDto.prototype, "progressionMode", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], StudyTreeResponseDto.prototype, "isStrictExam", void 0);
class MyCourseReviewDto {
    id;
    rating;
    comment;
    teacherReply;
    repliedAt;
    createdAt;
}
exports.MyCourseReviewDto = MyCourseReviewDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MyCourseReviewDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], MyCourseReviewDto.prototype, "rating", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], MyCourseReviewDto.prototype, "comment", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], MyCourseReviewDto.prototype, "teacherReply", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], MyCourseReviewDto.prototype, "repliedAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], MyCourseReviewDto.prototype, "createdAt", void 0);
class LessonProgressResponseDto {
    watchTime;
    lastPosition;
    isCompleted;
}
exports.LessonProgressResponseDto = LessonProgressResponseDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], LessonProgressResponseDto.prototype, "watchTime", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], LessonProgressResponseDto.prototype, "lastPosition", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], LessonProgressResponseDto.prototype, "isCompleted", void 0);
//# sourceMappingURL=course-reader-response.dto.js.map