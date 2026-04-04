import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types, PipelineStage } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import { Lesson, LessonDocument } from '../schemas/lesson.schema';

@Injectable()
export class LessonsRepository extends AbstractRepository<LessonDocument> {
  protected readonly logger = new Logger(LessonsRepository.name);

  constructor(
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(lessonModel, connection);
  }

  async getNextOrder(sectionId: string | Types.ObjectId): Promise<number> {
    const lastLesson = await this.lessonModel
      .findOne({ sectionId: new Types.ObjectId(sectionId) })
      .select('order')
      .sort({ order: -1 })
      .lean()
      .exec();
    return lastLesson ? lastLesson.order + 1 : 1;
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

  async bulkUpdateOrderAndSectionStrict(
    courseId: string,
    updates: { id: string; order: number; sectionId: string }[],
  ): Promise<any> {
    if (!updates.length) return;
    const ops = updates.map((u) => ({
      updateOne: {
        filter: {
          _id: new Types.ObjectId(u.id),
          courseId: new Types.ObjectId(courseId),
        },
        update: {
          $set: { order: u.order, sectionId: new Types.ObjectId(u.sectionId) },
        },
      },
    }));
    return this.model.bulkWrite(ops, {
      ordered: false,
      session: this.currentSession,
    });
  }

  async countLessonsByCourse(
    courseId: string | Types.ObjectId,
  ): Promise<number> {
    return this.model
      .countDocuments({
        courseId: new Types.ObjectId(courseId.toString()),
      })
      .exec();
  }

  async getPreviousLessonId(
    courseId: string,
    currentSectionOrder: number,
    currentLessonOrder: number,
  ): Promise<string | null> {
    const pipeline: PipelineStage[] = [
      { $match: { courseId: new Types.ObjectId(courseId) } },
      {
        $lookup: {
          from: 'course_sections',
          localField: 'sectionId',
          foreignField: '_id',
          as: 'section',
        },
      },
      { $unwind: '$section' },
      {
        $match: {
          $or: [
            { 'section.order': { $lt: currentSectionOrder } },
            {
              'section.order': currentSectionOrder,
              order: { $lt: currentLessonOrder },
            },
          ],
        },
      },
      { $sort: { 'section.order': -1, order: -1 } },
      { $limit: 1 },
      { $project: { _id: 1 } },
    ];

    const [result] = await this.model.aggregate(pipeline).exec();
    return result ? result._id.toString() : null;
  }
}
