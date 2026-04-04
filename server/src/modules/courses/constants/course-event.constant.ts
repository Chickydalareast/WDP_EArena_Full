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
  COURSE_ARCHIVED = 'course.archived',
  COURSE_STATUS_DEACTIVATED = 'course.status.deactivated',
  COURSE_QUESTION_ASKED = 'course.question_asked',
  COURSE_QUESTION_REPLIED = 'course.question_replied',
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

export interface CourseDeactivatedEventPayload {
  courseId: string;
  reason: 'ARCHIVED' | 'REJECTED';
}

export type CourseQuestionAskedEventPayload = {
  courseId: string;
  lessonId: string;
  teacherId: string;
  studentId: string;
  discussionId: string;
  questionPreview: string;
};

export type CourseQuestionRepliedEventPayload = {
  courseId: string;
  lessonId: string;
  rootDiscussionId: string;
  replyId: string;
  replierId: string;
  receiverId: string;
  replyPreview: string;
};