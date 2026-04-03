import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import {
  WithdrawalRequest,
  WithdrawalRequestDocument,
} from './schemas/withdrawal-request.schema';

@Injectable()
export class WithdrawalRequestsRepository extends AbstractRepository<WithdrawalRequestDocument> {
  protected readonly logger = new Logger(WithdrawalRequestsRepository.name);

  constructor(
    @InjectModel(WithdrawalRequest.name)
    private readonly requestModel: Model<WithdrawalRequestDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(requestModel, connection);
  }

  async getAdminWithdrawalRequests(
    status: string | undefined,
    page: number,
    limit: number,
  ) {
    const filter: any = {};
    if (status) filter.status = status;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.requestModel
        .find(filter)
        .populate('teacherId', 'fullName email phone')
        .populate('processedBy', 'fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.requestModel.countDocuments(filter).exec(),
    ]);

    return {
      items: data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
