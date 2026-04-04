import { JoinStatus } from '../schemas/class-member.schema';
export declare class GetMembersDto {
    status?: JoinStatus;
    page?: number;
    limit?: number;
}
