"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.NotificationEventPattern = void 0;
var NotificationEventPattern;
(function (NotificationEventPattern) {
    NotificationEventPattern["COURSE_COMPLETED"] = "course.completed";
    NotificationEventPattern["COURSE_NEW_LESSON"] = "course.new_lesson";
    NotificationEventPattern["EXAM_GRADED"] = "exam.graded";
    NotificationEventPattern["SYSTEM_MAINTENANCE"] = "system.maintenance";
    NotificationEventPattern["PAYMENT_SUCCESS"] = "payment.success";
    NotificationEventPattern["QUESTION_AUTO_TAG_BATCH_COMPLETED"] = "question.auto_tag_batch_completed";
})(NotificationEventPattern || (exports.NotificationEventPattern = NotificationEventPattern = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["SYSTEM"] = "SYSTEM";
    NotificationType["COURSE"] = "COURSE";
    NotificationType["EXAM"] = "EXAM";
    NotificationType["FINANCE"] = "FINANCE";
    NotificationType["COMMUNITY"] = "COMMUNITY";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
//# sourceMappingURL=notification-event.constant.js.map