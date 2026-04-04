import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class PublicProfileResponseDto {
  @Expose({ name: 'id' })
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  avatar?: string;

  @Expose()
  role: string;

  @Expose()
  bio?: string;
}
