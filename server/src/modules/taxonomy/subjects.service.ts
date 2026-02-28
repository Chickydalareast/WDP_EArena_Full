import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { SubjectsRepository } from './subjects.repository';
import { UsersService } from '../users/users.service';

@Injectable()
export class SubjectsService {
  constructor(
    private readonly subjectsRepo: SubjectsRepository,
    private readonly usersService: UsersService,
  ) {}

  async getMySubjects(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.subjectIds || user.subjectIds.length === 0) {
      return [];
    }

    return (this.subjectsRepo as any).model
      .find({ 
        _id: { $in: user.subjectIds },
        isActive: true 
      })
      .select('name code')
      .lean()
      .exec();
  }
}