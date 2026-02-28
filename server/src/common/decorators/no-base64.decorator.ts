import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class NoBase64Constraint implements ValidatorConstraintInterface {
  validate(text: string) {
    if (!text) return true;
    // Regex siêu tốc (O(n)): Quét tìm đúng pattern thẻ img chứa data:image/base64
    const base64ImgRegex = /<img[^>]+src=["']data:image\/[^;]+;base64[^"']+["'][^>]*>/i;
    return !base64ImgRegex.test(text);
  }

  defaultMessage() {
    return 'Nội dung chứa ảnh Base64. Bắt buộc phải upload qua API Media và sử dụng link URL (Cloudinary).';
  }
}

export function NoBase64Image(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: NoBase64Constraint,
    });
  };
}