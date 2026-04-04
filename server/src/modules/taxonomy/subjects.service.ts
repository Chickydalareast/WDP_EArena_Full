import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Types } from 'mongoose';
import { SubjectsRepository } from './subjects.repository';
import { UsersService } from '../users/users.service';

@Injectable()
export class SubjectsService {
  constructor(
    private readonly subjectsRepo: SubjectsRepository,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async getAllActiveSubjects() {
    return (this.subjectsRepo as any).model
      .find({ isActive: true })
      .select('name code description')
      .sort({ name: 1 })
      .lean()
      .exec();
  }

  async getMySubjects(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.subjectIds || user.subjectIds.length === 0) {
      return [];
    }

    return (this.subjectsRepo as any).model
      .find({
        _id: { $in: user.subjectIds },
        isActive: true,
      })
      .select('name code')
      .lean()
      .exec();
  }

  async findSubjectsByIds(ids: string[]) {
    const uniq = [...new Set(ids.filter(Boolean))];
    if (!uniq.length) return [];
    return (this.subjectsRepo as any).model
      .find({
        _id: { $in: uniq.map((id) => new Types.ObjectId(id)) },
        isActive: true,
      })
      .select('name code')
      .lean()
      .exec();
  }
}
