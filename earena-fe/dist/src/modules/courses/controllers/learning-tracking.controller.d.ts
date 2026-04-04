import { SyncHeartbeatDto } from '../dto/learning-tracking.dto';
import { LearningTrackingService } from '../services/learning-tracking.service';
export declare class LearningTrackingController {
    private readonly trackingService;
    constructor(trackingService: LearningTrackingService);
    syncHeartbeat(dto: SyncHeartbeatDto, userId: string): Promise<{
        message: string;
    }>;
}
