import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import {
  PricingPlan,
  PricingPlanDocument,
} from '../schemas/pricing-plan.schema';

@Injectable()
export class PricingPlansRepository extends AbstractRepository<PricingPlanDocument> {
  protected readonly logger = new Logger(PricingPlansRepository.name);

  constructor(
    @InjectModel(PricingPlan.name) model: Model<PricingPlanDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(model, connection);
  }
}
