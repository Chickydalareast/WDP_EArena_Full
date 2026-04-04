import { Logger } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import { PricingPlanDocument } from '../schemas/pricing-plan.schema';
export declare class PricingPlansRepository extends AbstractRepository<PricingPlanDocument> {
    protected readonly logger: Logger;
    constructor(model: Model<PricingPlanDocument>, connection: Connection);
}
