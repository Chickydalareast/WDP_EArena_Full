import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaProcessor } from './media.processor';
import { CloudinaryAdapter } from './providers/cloudinary.provider';
import { GoogleDriveAdapter } from './providers/google-drive.provider';
import {
  CLOUDINARY_PROVIDER,
  VIDEO_PROVIDER,
} from './interfaces/storage-provider.interface';
import { Media, MediaSchema } from './schemas/media.schema';
import { MediaRepository } from './media.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
    BullModule.registerQueue({
      name: 'media',
    }),
  ],
  controllers: [MediaController],
  providers: [
    MediaService,
    MediaProcessor,
    MediaRepository,
    { provide: CLOUDINARY_PROVIDER, useClass: CloudinaryAdapter },
    { provide: VIDEO_PROVIDER, useClass: GoogleDriveAdapter },
  ],
  exports: [MediaService, MediaRepository, CLOUDINARY_PROVIDER],
})
export class MediaModule {}
