import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import { Section, SectionDocument } from '../schemas/section.schema';

@Injectable()
export class SectionsRepository extends AbstractRepository<SectionDocument> {
  protected readonly logger = new Logger(SectionsRepository.name);

  constructor(
    @InjectModel(Section.name)
    private readonly sectionModel: Model<SectionDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(sectionModel, connection);
  }

  async getNextOrder(courseId: string | Types.ObjectId): Promise<number> {
    const lastSection = await this.sectionModel
      .findOne({ courseId: new Types.ObjectId(courseId) })
      .select('order')
      .sort({ order: -1 })
      .lean()
      .exec();
    return lastSection ? lastSection.order + 1 : 1;
  }

  async bulkUpdateOrder(
    updates: { id: string; order: number }[],
  ): Promise<any> {
    if (!updates.length) return;
    const ops = updates.map((u) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(u.id) },
        update: { $set: { order: u.order } },
      },
    }));
    return this.model.bulkWrite(ops, { ordered: false });
  }

  async bulkUpdateOrderAndSection(
    updates: { id: string; order: number; sectionId: string }[],
  ): Promise<any> {
    if (!updates.length) return;
    const ops = updates.map((u) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(u.id) },
        update: {
          $set: { order: u.order, sectionId: new Types.ObjectId(u.sectionId) },
        },
      },
    }));
    return this.model.bulkWrite(ops, { ordered: false });
  }

  async bulkUpdateOrderStrict(
    courseId: string,
    updates: { id: string; order: number }[],
  ): Promise<any> {
    if (!updates.length) return;
    const ops = updates.map((u) => ({
      updateOne: {
        filter: {
          _id: new Types.ObjectId(u.id),
          courseId: new Types.ObjectId(courseId),
        },
        update: { $set: { order: u.order } },
      },
    }));
    return this.model.bulkWrite(ops, {
      ordered: false,
      session: this.currentSession,
    });
  }
}
