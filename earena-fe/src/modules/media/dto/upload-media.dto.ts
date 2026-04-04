import { IsEnum, IsNotEmpty } from 'class-validator';
import { MediaContext } from '../schemas/media.schema';

export class UploadMediaDto {
  @IsNotEmpty({ message: 'Ngữ cảnh (context) không được để trống' })
  @IsEnum(MediaContext, { message: 'Ngữ cảnh (context) không hợp lệ' })
  context: MediaContext;
}
