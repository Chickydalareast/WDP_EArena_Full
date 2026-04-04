import { Expose, Type } from 'class-transformer';

export class MediaResponseDto {
  @Expose() id: string;
  @Expose() url?: string | null;
  @Expose() blurHash?: string | null;
  @Expose() duration?: number | null;
  @Expose() originalName?: string;
  @Expose() mimetype?: string;
  @Expose() size?: number;
}

export class ExamRuleConfigResponseDto {
  @Expose() timeLimit: number;
  @Expose() maxAttempts: number;
  @Expose() passPercentage: number;
  @Expose() showResultMode: string;
}

export class LessonResponseDto {
  @Expose() id: string;
  @Expose() title: string;
  @Expose() order: number;
  @Expose() isFreePreview: boolean;
  @Expose() content?: string | null;
  @Expose() examId?: string | null;
  
  @Expose() examMode?: string | null; 
  @Expose() examType?: string | null;

  @Expose() isCompleted?: boolean;

  @Expose()
  @Type(() => ExamRuleConfigResponseDto)
  examRules?: ExamRuleConfigResponseDto | null;

  @Expose()
  @Type(() => MediaResponseDto)
  primaryVideo?: MediaResponseDto | null;

  @Expose()
  @Type(() => MediaResponseDto)
  attachments?: MediaResponseDto[];

  @Expose()
  @Type(() => LessonProgressResponseDto)
  progress?: LessonProgressResponseDto | null;
}

export class SectionResponseDto {
  @Expose() id: string;
  @Expose() title: string;
  @Expose() description?: string;
  @Expose() order: number;

  @Expose()
  @Type(() => LessonResponseDto)
  lessons: LessonResponseDto[];
}

export class CurriculumResponseDto {
  @Expose() id: string;
  @Expose() totalLessons: number;
  @Expose() totalVideos: number;
  @Expose() totalDocuments: number;
  @Expose() totalQuizzes: number;

  @Expose()
  @Type(() => SectionResponseDto)
  sections: SectionResponseDto[];
}

export class CourseTeacherDto {
  @Expose() id: string;
  @Expose() fullName: string;
  @Expose() avatar?: string;
  @Expose() bio?: string;
}

export class CourseSubjectDto {
  @Expose() id: string;
  @Expose() name: string;
}

export class CourseBasicDto {
  @Expose() id: string;
  @Expose() title: string;
  @Expose() slug: string;
  @Expose() description: string;
  @Expose() price: number;
  @Expose() discountPrice?: number;
  @Expose() status: string;
  @Expose() averageRating: number;
  @Expose() totalReviews: number;
  @Expose() benefits: string[];
  @Expose() requirements: string[];
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  @Expose()
  @Type(() => CourseTeacherDto)
  teacher: CourseTeacherDto;

  @Expose()
  @Type(() => CourseSubjectDto)
  subject: CourseSubjectDto;

  @Expose()
  @Type(() => MediaResponseDto)
  coverImage?: MediaResponseDto;

  @Expose()
  @Type(() => MediaResponseDto)
  promotionalVideo?: MediaResponseDto;

  @Expose() progressionMode: string;
  @Expose() isStrictExam: boolean;
}

export class CoursePublicDetailResponseDto {
  @Expose() isEnrolled: boolean;

  @Expose()
  @Type(() => CourseBasicDto)
  course: CourseBasicDto;

  @Expose()
  @Type(() => CurriculumResponseDto)
  curriculum: CurriculumResponseDto;
}

export class StudyTreeResponseDto {
  @Expose() progress: number;
  @Expose() status: string;

  @Expose()
  @Type(() => CurriculumResponseDto)
  curriculum: CurriculumResponseDto;

  @Expose()
  @Type(() => MyCourseReviewDto)
  myReview: MyCourseReviewDto | null;

  @Expose() progressionMode: string;
  @Expose() isStrictExam: boolean;
}
export class MyCourseReviewDto {
  @Expose() id: string;
  @Expose() rating: number;
  @Expose() comment: string | null;
  @Expose() teacherReply: string | null;
  @Expose() repliedAt: Date | null;
  @Expose() createdAt: Date;
}

export class LessonProgressResponseDto {
  @Expose() watchTime: number;
  @Expose() lastPosition: number;
  @Expose() isCompleted: boolean;
}

export class LessonContentResponseDto extends LessonResponseDto {
  @Expose() attemptsUsed?: number;
}