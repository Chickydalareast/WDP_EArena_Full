import { SubjectsRepository } from './subjects.repository';
import { UsersService } from '../users/users.service';
export declare class SubjectsService {
    private readonly subjectsRepo;
    private readonly usersService;
    constructor(subjectsRepo: SubjectsRepository, usersService: UsersService);
    getAllActiveSubjects(): Promise<any>;
    getMySubjects(userId: string): Promise<any>;
    findSubjectsByIds(ids: string[]): Promise<any>;
}
