import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { CloudinaryAdapter } from './providers/cloudinary.provider';
import { STORAGE_PROVIDER } from './interfaces/storage-provider.interface';
import { Media, MediaSchema } from './schemas/media.schema';
import { MediaRepository } from './media.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
  ],
  controllers: [MediaController],
  providers: [
    MediaService,
    MediaRepository,
    {
      provide: STORAGE_PROVIDER,
      useClass: CloudinaryAdapter,
    },
  ],
  exports: [MediaService, MediaRepository], 
})
export class MediaModule {}