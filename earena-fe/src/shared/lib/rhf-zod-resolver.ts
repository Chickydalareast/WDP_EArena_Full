import { zodResolver } from '@hookform/resolvers/zod';
import type { FieldValues, Resolver } from 'react-hook-form';

/**
 * Zod 4 + @hookform/resolvers thường lệch kiểu input/output với useForm.
 * Ép Resolver về generic form để bật lại `tsc` mà không đổi runtime.
 */
export function rhfZodResolver<T extends FieldValues = FieldValues>(
  schema: Parameters<typeof zodResolver>[0],
): Resolver<T> {
  return zodResolver(schema as never) as Resolver<T>;
}
