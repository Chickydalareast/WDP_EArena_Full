import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { WithdrawalApprovalMailPayload, WithdrawalRejectionMailPayload } from './interfaces/mail-withdrawal.interface';
export interface SendOtpPayload {
    email: string;
    name: string;
    otp: string;
}
export interface CourseApprovalPayload {
    email: string;
    name: string;
    courseTitle: string;
    status: string;
}
export interface CourseRejectionPayload {
    email: string;
    name: string;
    courseTitle: string;
    status: string;
    reason: string;
}
export interface TeacherApprovalPayload {
    email: string;
    name: string;
    note?: string;
}
export interface TeacherRejectionPayload {
    email: string;
    name: string;
    reason?: string;
}
type MailJobPayload = SendOtpPayload | CourseApprovalPayload | CourseRejectionPayload | WithdrawalApprovalMailPayload | WithdrawalRejectionMailPayload | TeacherApprovalPayload | TeacherRejectionPayload;
export declare class MailProcessor extends WorkerHost {
    private readonly mailerService;
    private readonly configService;
    private readonly logger;
    private readonly fromEmail;
    private readonly logoUrl;
    constructor(mailerService: MailerService, configService: ConfigService);
    process(job: Job<MailJobPayload>): Promise<any>;
    private handleSendOtp;
    private handleCourseApproval;
    private handleCourseRejection;
    private handleWithdrawalApproval;
    private handleWithdrawalRejection;
    private handleTeacherApproval;
    private handleTeacherRejection;
}
export {};
