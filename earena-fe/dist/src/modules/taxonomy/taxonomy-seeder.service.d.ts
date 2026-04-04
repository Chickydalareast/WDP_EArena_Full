import { OnApplicationBootstrap } from '@nestjs/common';
import { SubjectsRepository } from './subjects.repository';
export declare class TaxonomySeederService implements OnApplicationBootstrap {
    private readonly subjectsRepo;
    private readonly logger;
    constructor(subjectsRepo: SubjectsRepository);
    onApplicationBootstrap(): Promise<void>;
}
