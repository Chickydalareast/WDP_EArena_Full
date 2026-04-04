import { Expose, Transform } from 'class-transformer';

export class MediaResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  id: string;

  @Expose()
  url: string;

  @Expose()
  blurHash: string | null;

  @Expose()
  originalName: string;

  @Expose()
  context: string;
}
