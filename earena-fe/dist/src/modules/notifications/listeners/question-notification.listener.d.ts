import { NotificationsService } from '../notifications.service';
export declare class QuestionNotificationListener {
    private readonly notificationsService;
    private readonly logger;
    constructor(notificationsService: NotificationsService);
    handleAutoTagBatchCompleted(payload: any): Promise<void>;
}
