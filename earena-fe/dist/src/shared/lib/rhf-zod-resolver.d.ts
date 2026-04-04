import { zodResolver } from '@hookform/resolvers/zod';
import type { FieldValues, Resolver } from 'react-hook-form';
export declare function rhfZodResolver<T extends FieldValues = FieldValues>(schema: Parameters<typeof zodResolver>[0]): Resolver<T>;
