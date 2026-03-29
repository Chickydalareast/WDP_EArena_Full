export enum CourseEventPattern {
    COURSE_COMPLETED = 'course.completed',
    LESSON_COMPLETED = 'lesson.completed',
    COURSE_SUBMITTED = 'course.submitted',
    COURSE_APPROVED = 'course.approved',
    COURSE_REJECTED = 'course.rejected',
    COURSE_REVIEWED = 'course.reviewed',
    REVIEW_REPLIED = 'review.replied',
    COURSE_PURCHASED = 'course.purchased',
    COURSE_SOLD = 'course.sold',
    COURSE_NEW_LESSON = 'course.new_lesson',
}

export interface CourseSubmittedEventPayload {
    courseId: string;
    teacherId: string;
    courseTitle: string;
}


export interface CourseCompletedEventPayload {
    userId: string;
    courseId: string;
}

export interface CourseApprovedEventPayload {
    courseId: string;
    teacherId: string;
    courseTitle: string;
}

export interface CourseRejectedEventPayload {
    courseId: string;
    teacherId: string;
    courseTitle: string;
    reason: string;
}

export interface CourseReviewedEventPayload {
    courseId: string;
    teacherId: string;
    studentId: string;
    courseTitle: string;
    rating: number;
}

export interface ReviewRepliedEventPayload {
    reviewId: string;
    courseId: string;
    studentId: string;
    teacherId: string;
    courseTitle: string;
}

export interface CoursePurchasedEventPayload {
    userId: string;
    courseId: string;
    courseTitle: string;
}

export interface CourseSoldEventPayload {
    teacherId: string;
    studentId: string;
    courseId: string;
    courseTitle: string;
    revenueAmount: number;
}

export interface CourseNewLessonEventPayload {
    courseId: string;
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
}