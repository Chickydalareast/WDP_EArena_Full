import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types, QueryFilter } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { User, UserDocument } from './schemas/user.schema';

export interface PopulatedSubscriptionPlan {
  _id: Types.ObjectId;
  code: string;
  name: string;
  isActive: boolean;
  canCreatePaidCourse: boolean;
  isUnlimitedCourses: boolean;
  maxCourses: number;
}

export interface UserSubscriptionData {
  _id: Types.ObjectId;
  role: string;
  status: string;
  planExpiresAt?: Date;
  currentPlanId?: PopulatedSubscriptionPlan | null;
}

@Injectable()
export class UsersRepository extends AbstractRepository<UserDocument> {
  protected readonly logger = new Logger(UsersRepository.name);

  constructor(
    @InjectModel(User.name) userModel: Model<UserDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(userModel, connection);
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.model
      .findOne({ email } as QueryFilter<UserDocument>)
      .select('+password')
      .lean()
      .exec() as Promise<UserDocument | null>;
  }

  async findByIdWithPassword(
    id: string | Types.ObjectId,
  ): Promise<UserDocument | null> {
    return this.model
      .findById(new Types.ObjectId(id.toString()))
      .select('+password')
      .lean()
      .exec() as Promise<UserDocument | null>;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.findOneSafe({ email } as QueryFilter<UserDocument>);
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const result = await this.model.exists({
      email,
    } as QueryFilter<UserDocument>);
    return !!result;
  }

  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{ data: UserDocument[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find({}).skip(skip).limit(limit).lean().exec() as Promise<
        UserDocument[]
      >,
      this.model.countDocuments({}).exec(),
    ]);

    return { data, total };
  }

  async findUserWithSubscription(
    userId: string | Types.ObjectId,
  ): Promise<UserSubscriptionData | null> {
    const user = await this.model
      .findById(new Types.ObjectId(userId.toString()))
      .select('currentPlanId planExpiresAt role status')
      .populate(
        'currentPlanId',
        'code name isActive canCreatePaidCourse isUnlimitedCourses maxCourses',
      )
      .lean()
      .exec();

    return user as unknown as UserSubscriptionData | null;
  }
}
