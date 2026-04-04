import { MailService } from './mail.service';
export declare class MailController {
    private readonly mailService;
    constructor(mailService: MailService);
    testMail(body: {
        email: string;
    }): Promise<{
        success: boolean;
        message: string;
        debug: {
            email: string;
            otp: string;
        };
    }>;
}
