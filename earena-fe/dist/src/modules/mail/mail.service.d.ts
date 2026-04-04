import { Queue } from 'bullmq';
import { WithdrawalApprovalMailPayload, WithdrawalRejectionMailPayload } from './interfaces/mail-withdrawal.interface';
export declare class MailService {
    private mailQueue;
    private readonly logger;
    constructor(mailQueue: Queue);
    sendUserOtp(email: string, name: string, otp: string): Promise<boolean>;
    sendCourseApproval(email: string, name: string, courseTitle: string): Promise<boolean>;
    sendCourseRejection(email: string, name: string, courseTitle: string, reason: string): Promise<boolean>;
    addWithdrawalApprovalJob(payload: WithdrawalApprovalMailPayload): Promise<void>;
    addWithdrawalRejectionJob(payload: WithdrawalRejectionMailPayload): Promise<void>;
    sendTeacherVerificationApproval(email: string, name: string, note?: string): Promise<boolean>;
    sendTeacherVerificationRejection(email: string, name: string, reason?: string): Promise<boolean>;
}
