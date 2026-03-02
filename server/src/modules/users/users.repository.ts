import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersRepository extends AbstractRepository<UserDocument> {
  protected readonly logger = new Logger(UsersRepository.name);

  constructor(
    @InjectModel(User.name) userModel: Model<UserDocument>,
    @InjectConnection() connection: Connection, // <-- Tiêm Connection ở đây
  ) {
    super(userModel, connection); // <-- Chuyền nó lên cho AbstractRepository
  }
}